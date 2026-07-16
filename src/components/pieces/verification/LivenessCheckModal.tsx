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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { useSecurity } from '../../../hooks/useSecurity';

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
  // Temporal smoothing: only flip to "face present" after a few good frames,
  // and drop immediately when the face leaves the oval.
  const faceStreak = useRef(0);

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
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
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
    faceStreak.current = 0;
    setFaceDetected(false);
    const canvas = document.createElement('canvas');
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 220) return;
      last = t;
      const video = videoRef.current;
      if (!video || !video.videoWidth) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      const w = 160;
      const h = Math.max(1, Math.round((160 * video.videoHeight) / video.videoWidth));
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);

      // Average brightness → room lighting.
      const all = ctx.getImageData(0, 0, w, h).data;
      let total = 0;
      let count = 0;
      for (let i = 0; i < all.length; i += 16) {
        total += (all[i] + all[i + 1] + all[i + 2]) / 3;
        count += 1;
      }
      const avg = total / count;
      const light: Lighting = avg < 45 ? 'low' : avg > 210 ? 'too-bright' : 'good';
      setLighting(light);

      // Skin-tone ratio in the centre oval vs. the four corners. A face that
      // fills the oval reads high in the centre and low at the corners; when it
      // drifts out of the oval the centre ratio drops, so it won't stay green.
      const skinRatio = (rx: number, ry: number, rw: number, rh: number) => {
        const region = ctx.getImageData(
          Math.max(0, Math.floor(rx)),
          Math.max(0, Math.floor(ry)),
          Math.max(1, Math.floor(rw)),
          Math.max(1, Math.floor(rh)),
        ).data;
        let s = 0;
        let m = 0;
        for (let i = 0; i < region.length; i += 8) {
          const rr = region[i];
          const gg = region[i + 1];
          const bb = region[i + 2];
          const br = (rr + gg + bb) / 3;
          // Loose skin-tone gate: warm (r > b), mid brightness.
          if (br >= 60 && br <= 200 && rr > bb) s += 1;
          m += 1;
        }
        return m ? s / m : 0;
      };

      const center = skinRatio(w * 0.34, h * 0.24, w * 0.32, h * 0.5);
      const cs = w * 0.16;
      const ch = h * 0.16;
      const corners =
        (skinRatio(0, 0, cs, ch) +
          skinRatio(w - cs, 0, cs, ch) +
          skinRatio(0, h - ch, cs, ch) +
          skinRatio(w - cs, h - ch, cs, ch)) /
        4;

      const goodFrame = light === 'good' && center > 0.45 && center - corners > 0.18;
      faceStreak.current = goodFrame
        ? Math.min(3, faceStreak.current + 1)
        : Math.max(0, faceStreak.current - 2);
      setFaceDetected(faceStreak.current >= 2);
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
  const lightingBad = lighting !== 'good';
  // "Ready" (green) requires BOTH good lighting AND a face centred in the oval.
  const ready = phase === 'ready' && lighting === 'good' && faceDetected;
  // Capture is the "go ahead" — only allowed on a green frame. When the frame
  // is live but not ready we show a red border and guidance so the user fixes
  // their lighting/position first.
  const canCapture = ready;
  // Live camera but not yet a good frame → red error state.
  const liveNotReady = phase === 'ready' && !ready;

  const frameBorder = ready
    ? 'border-emerald-500'
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
              : 'Looking good — capture now';

  const statusClass = ready
    ? 'text-emerald-600 dark:text-emerald-400'
    : liveNotReady
      ? 'text-red-600 dark:text-red-400'
      : 'text-foreground';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            Liveness check
          </DialogTitle>
          <DialogDescription>{reason}</DialogDescription>
        </DialogHeader>

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
                    ready ? 'border-emerald-400' : liveNotReady ? 'border-red-400' : 'border-white/80'
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
                  ready ? 'bg-emerald-500' : liveNotReady ? 'bg-red-500' : 'bg-muted-foreground'
                }`}
              />
              <p className={`text-sm font-medium ${statusClass}`}>{statusText}</p>
            </div>

            <Button className="w-full rounded-full" onClick={capture} disabled={!canCapture}>
              <Camera size={16} className="mr-1.5" />
              {ready ? 'Capture photo' : 'Adjust lighting & position'}
            </Button>
            {liveNotReady && (
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
              <Button className="flex-1 rounded-full" onClick={() => complete()}>
                Simulated check
              </Button>
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
          Required once every 30 days. Your check stays valid for other deals during that time.
        </p>
      </DialogContent>
    </Dialog>
  );
}
