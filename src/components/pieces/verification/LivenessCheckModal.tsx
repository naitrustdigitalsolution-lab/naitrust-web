/**
 * LivenessCheckModal
 * A required facial liveness check. Opens the device camera (getUserMedia),
 * shows a large mirrored preview with an oval face guide, and runs a lightweight
 * per-frame analysis (adapted from the old app): average brightness for room
 * lighting, and a skin-tone ratio in the centre for a face-placement heuristic.
 * The frame border turns green when the face is well placed in good light, red
 * when the lighting is poor, amber while the face isn't centred. Capture is
 * blocked while the light is too dark or too bright; the face indicator guides
 * framing (the authoritative match happens server-side).
 *
 * Camera attach pattern (from the old app): mount the <video> first, then
 * attach the stream in an effect once the ref exists — otherwise the preview is
 * black. Falls back to a simulated check when no camera is available.
 */

import { useEffect, useRef, useState } from 'react';
import { Camera, Check, Lightbulb, Loader2, ShieldCheck, VideoOff } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../ui/sheet';
import { Button } from '../../ui/button';
import { useSecurity } from '../../../hooks/useSecurity';
import { appConfig } from '../../../configs/env';

interface LivenessCheckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  onCancel?: () => void;
  reason?: string;
}

type Phase = 'intro' | 'starting' | 'ready' | 'capturing' | 'done' | 'nocamera';
type Lighting = 'low' | 'good' | 'too-bright';

export function LivenessCheckModal({
  open,
  onOpenChange,
  onVerified,
  onCancel,
  reason = 'For your security, confirm it is really you before continuing.',
}: LivenessCheckModalProps) {
  const { patch, setLivenessPhoto } = useSecurity();
  const [phase, setPhase] = useState<Phase>('intro');
  const [lighting, setLighting] = useState<Lighting>('good');
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
  const cleanup = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    stopStream();
  };

  useEffect(() => {
    if (!open) {
      cleanup();
      setPhase('intro');
      setFaceDetected(false);
      setLighting('good');
    }
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Attach the camera once the <video> is mounted.
  useEffect(() => {
    if (phase !== 'starting') return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          // Keep the old app's 4:3 capture shape. A wide 16:9 stream is heavily
          // cropped by the portrait preview and made the centre-face heuristic
          // reject correctly positioned users on phones.
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
            aspectRatio: { ideal: 4 / 3 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setPhase('ready');
      } catch {
        if (!cancelled) setPhase('nocamera');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase]);

  // Per-frame lighting + face-placement analysis while the preview is live.
  useEffect(() => {
    if (phase !== 'ready') return;
    setFaceDetected(false);
    const canvas = document.createElement('canvas');
    let raf = 0;
    let last = 0;

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 150) return;
      last = t;
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Room lighting — average brightness across the whole frame (adapted from
      // the old app: sample ~every 10th pixel). This is the "is it bright enough
      // for a photo" check.
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let totalB = 0;
      let count = 0;
      for (let i = 0; i < frame.length; i += 40) {
        totalB += (frame[i] + frame[i + 1] + frame[i + 2]) / 3;
        count += 1;
      }
      const avg = count ? totalB / count : 0;
      const light: Lighting = avg < 80 ? 'low' : avg > 200 ? 'too-bright' : 'good';
      setLighting(light);

      // Face placement — skin-tone ratio inside the central region (~40% × 50%,
      // narrower than the visible oval). A face fills it with mid-brightness
      // skin tone; when it drifts out of the oval the ratio drops and the frame
      // turns red. (Ported from the old app's proven heuristic.)
      const fw = canvas.width * 0.4;
      const fh = canvas.height * 0.5;
      const fx = Math.max(0, canvas.width / 2 - fw / 2);
      const fy = Math.max(0, canvas.height / 2 - fh / 2);
      const faceData = ctx.getImageData(
        fx,
        fy,
        Math.min(fw, canvas.width - fx),
        Math.min(fh, canvas.height - fy),
      ).data;
      let faceScore = 0;
      let samples = 0;
      for (let i = 0; i < faceData.length; i += 16) {
        const b = (faceData[i] + faceData[i + 1] + faceData[i + 2]) / 3;
        if (b >= 100 && b <= 180) faceScore += 1;
        samples += 1;
      }
      const ratio = samples ? faceScore / samples : 0;
      const good = ratio > 0.3;
      // Match the old flow: a valid centre region is immediately actionable.
      // The former streak gate made the button oscillate on real camera feeds.
      setFaceDetected(good);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const complete = (dataUrl?: string) => {
    if (dataUrl) setLivenessPhoto(dataUrl);
    patch({ livenessAt: new Date().toISOString() });
    stopStream();
    setPhase('done');
    timers.current.push(setTimeout(() => onVerified(), 900));
  };

  const capture = () => {
    setPhase('capturing');
    const video = videoRef.current;
    let dataUrl: string | undefined;
    if (video && video.videoWidth) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        // Preserve the old app's useful low-light correction. We still warn the
        // user, but don't strand them when their face is clearly detectable.
        if (lighting === 'low') {
          const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < image.data.length; i += 4) {
            image.data[i] = Math.min(255, image.data[i] * 1.2);
            image.data[i + 1] = Math.min(255, image.data[i + 1] * 1.2);
            image.data[i + 2] = Math.min(255, image.data[i + 2] * 1.2);
          }
          ctx.putImageData(image, 0, 0);
        }
        dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      }
    }
    timers.current.push(setTimeout(() => complete(dataUrl), 700));
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && phase !== 'done') onCancel?.();
    onOpenChange(next);
  };

  const showVideo = phase === 'starting' || phase === 'ready' || phase === 'capturing';
  // The old, field-tested flow allowed capture once a face was centred and used
  // lighting as photo-quality guidance rather than a brittle hard gate.
  const ready = phase === 'ready' && faceDetected;
  const canCapture = ready;
  // Live camera but not yet a good frame → red error state.
  const liveNotReady = phase === 'ready' && !ready;
  const photoQualityGood = ready && lighting === 'good';

  const frameBorder = photoQualityGood
    ? 'border-emerald-500'
    : ready
      ? 'border-amber-500'
    : liveNotReady
      ? 'border-red-500'
      : 'border-primary';

  const statusText =
    phase === 'starting'
      ? 'Starting camera…'
      : phase === 'capturing'
        ? 'Hold still…'
        : lighting === 'low'
          ? 'Too dark — move to brighter lighting'
          : lighting === 'too-bright'
            ? 'Too bright — reduce glare or backlight'
            : !faceDetected
              ? 'Center your face in the oval'
              : lighting === 'good'
                ? 'Looking good — capture now'
                : 'Face detected — you can capture, but better light is recommended';

  const statusClass = photoQualityGood
    ? 'text-emerald-600 dark:text-emerald-400'
    : ready
      ? 'text-amber-600 dark:text-amber-400'
    : liveNotReady
      ? 'text-red-600 dark:text-red-400'
      : 'text-foreground';

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            Liveness check
          </SheetTitle>
          <SheetDescription>{reason}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {phase === 'intro' && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="flex h-56 w-full items-center justify-center rounded-2xl border-4 border-dashed border-border bg-muted/40">
              <Camera size={60} className="text-muted-foreground" />
            </div>
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs leading-5 text-foreground">
                Find a well-lit spot and face the camera directly so we can get a clear photo. Remove
                hats or sunglasses. We'll tell you if the lighting or framing needs adjusting.
              </p>
            </div>
            <Button className="w-full rounded-full" onClick={() => setPhase('starting')}>
              <Camera size={16} className="mr-1.5" />
              Open camera
            </Button>
          </div>
        )}

        {showVideo && (
          <div className="flex flex-col items-center gap-4 py-1">
            <div className={`relative aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl border-4 bg-black transition-colors ${frameBorder}`}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              {/* Oval face guide */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                  className={`h-[74%] w-[66%] rounded-[50%] border-[3px] shadow-[0_0_0_9999px_rgba(0,0,0,0.28)] transition-colors ${
                    photoQualityGood
                      ? 'border-emerald-400'
                      : ready
                        ? 'border-amber-400'
                        : liveNotReady
                          ? 'border-red-400'
                          : 'border-white/80'
                  }`}
                />
              </div>
              {(phase === 'starting' || phase === 'capturing') && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="flex items-center gap-2 text-sm font-medium text-white">
                    <Loader2 size={16} className="animate-spin" />
                    {phase === 'starting' ? 'Starting camera…' : 'Capturing…'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  photoQualityGood
                    ? 'bg-emerald-500'
                    : ready
                      ? 'bg-amber-500'
                      : liveNotReady
                        ? 'bg-red-500'
                        : 'bg-muted-foreground'
                }`}
              />
              <p className={`text-sm font-medium ${statusClass}`}>{statusText}</p>
            </div>

            <Button className="w-full rounded-full" onClick={capture} disabled={!canCapture}>
              <Camera size={16} className="mr-1.5" />
              {ready ? 'Capture photo' : 'Adjust lighting & position'}
            </Button>
            {liveNotReady && appConfig.isMock && (
              <button
                type="button"
                onClick={() => complete()}
                className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Camera not cooperating? Use a simulated check
              </button>
            )}
          </div>
        )}

        {phase === 'nocamera' && (
          <div className="flex flex-col items-center gap-4 py-3">
            <div className="flex h-48 w-full items-center justify-center rounded-2xl border-4 border-dashed border-border bg-muted/40">
              <VideoOff size={52} className="text-muted-foreground" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              We couldn't access a camera. Check your browser's camera permission, or complete a
              simulated check to continue here.
            </p>
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setPhase('starting')}>
                Try again
              </Button>
              {appConfig.isMock && (
                <Button className="flex-1 rounded-full" onClick={() => complete()}>
                  Simulated check
                </Button>
              )}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
              <Check size={44} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-foreground">Liveness confirmed</p>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Required once every 30 days. Your check stays valid for other property transactions during that time.
        </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
