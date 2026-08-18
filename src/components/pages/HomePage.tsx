import { useEffect, useRef, useState } from "react";
import {
  Shield,
  CheckCircle2,
  Users,
  Lock,
  ArrowRight,
  Star,
  ChevronRight,
  Globe,
  Handshake,
  Fingerprint,
  ScanLine,
  Landmark,
  Send,
  ArrowDownToLine,
  MessageCircle,
  Building2,
  Search,
  ReceiptText,
  CreditCard,
  Languages,
  PackageCheck,
  Store,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { motion } from "motion/react";
import { ImageWithFallback } from "../utility/ImageWithFallback";
import { TrustHeroAnimation } from "../pieces/general/TrustHeroAnimation";
import { AnimatedHeroText } from "../pieces/general/AnimatedHeroText";
import { QoreIDLogo, AnchorLogo } from "../pieces/general/TrustedPartnerLogo";
import { FloatingFeedbackButton } from "../utility/FloatingFeedbackButton";
import { SEOHead } from "../utility/SEOHead";
import spiralBackground from "../../assets/spiral.svg";
import { openWaitlistModal } from "../modals/waitlist-events";
import { pageImages } from "../../libs/images/image-manifest";
import tradersLocalBusinessesImage from "../../assets/home/traders-local-businesses.jpg";
import localTailoringBusinessImage from "../../assets/home/local-tailoring-business.jpg";
import wholesaleJourneyDesktopMp4 from "../../assets/home/wholesale-sourcing-journey-desktop.mp4";
import wholesaleJourneyDesktopWebm from "../../assets/home/wholesale-sourcing-journey-desktop.webm";
import wholesaleJourneyMobileMp4 from "../../assets/home/wholesale-sourcing-journey-mobile.mp4";
import wholesaleJourneyMobileWebm from "../../assets/home/wholesale-sourcing-journey-mobile.webm";

const saferDealsImage = "/images/blog/safer-deals.webp";
interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [allowAmbientMotion, setAllowAmbientMotion] = useState(false);
  const [allowHeroVideo, setAllowHeroVideo] = useState(false);
  const [heroVideoPlaying, setHeroVideoPlaying] = useState(true);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [useHeroViewportHeight, setUseHeroViewportHeight] = useState(true);

  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    );
    const updateMotionPreference = () => setAllowAmbientMotion(media.matches);
    updateMotionPreference();
    media.addEventListener("change", updateMotionPreference);
    return () => media.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const updateVideoPreference = () => {
      setAllowHeroVideo(media.matches);
      setHeroVideoPlaying(media.matches);
    };
    updateVideoPreference();
    media.addEventListener("change", updateVideoPreference);
    return () => media.removeEventListener("change", updateVideoPreference);
  }, []);

  const toggleHeroVideo = async () => {
    const video = heroVideoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play();
      setHeroVideoPlaying(true);
      return;
    }
    video.pause();
    setHeroVideoPlaying(false);
  };

  useEffect(() => {
    const updateHeroHeight = () => {
      if (!window.outerWidth) return;
      const zoomRatio = window.outerWidth / window.innerWidth;
      setUseHeroViewportHeight(zoomRatio > 0.77);
    };

    updateHeroHeight();
    window.addEventListener("resize", updateHeroHeight);
    return () => window.removeEventListener("resize", updateHeroHeight);
  }, []);

  const accountCapabilities = [
    {
      step: "1",
      title: "Discover Verified Suppliers",
      description:
        "Search products and verified suppliers in Nigeria and China from one clear marketplace.",
      icon: Search,
    },
    {
      step: "2",
      title: "Understand Every Listing",
      description:
        "Review products, specifications, minimum quantities and Chinese supplier details in English.",
      icon: Languages,
    },
    {
      step: "3",
      title: "Confirm the Landed Cost",
      description:
        "Receive an itemized quote for products, inspection, customs, handling and delivery before paying.",
      icon: Shield,
    },
    {
      step: "4",
      title: "Protect Supplier Payment",
      description:
        "Keep product funds protected while Naitrust coordinates the supplier and your order.",
      icon: Lock,
    },
    {
      step: "5",
      title: "Track Logistics",
      description:
        "Follow inspection, export pickup, international transit, customs and local delivery.",
      icon: Globe,
    },
    {
      step: "6",
      title: "Receive It at Your Door",
      description:
        "Review the delivered order and approve supplier payment only at the agreed stage.",
      icon: PackageCheck,
    },
  ];

  const faqs = [
    {
      question: "What is Naitrust Market?",
      answer:
        "It is a marketplace where Nigerians discover verified local and Chinese suppliers, browse products in English, request a confirmed landed-cost quote, pay, and follow delivery.",
    },
    {
      question: "Can I pay the catalogue price immediately?",
      answer:
        "Catalogue prices are estimates. Submit your cart and destination first, then Naitrust confirms the products, exchange rate, inspection, customs, handling and logistics in a time-limited quote.",
    },
    {
      question: "How does Naitrust protect an import order?",
      answer:
        "Supplier product funds stay protected through the agreed order stages. Naitrust keeps supplier checks, documents, translated updates, logistics, evidence and issues together while regulated payment partners handle money movement.",
    },
    {
      question: "Who is Naitrust for?",
      answer:
        "Naitrust is for Nigerian individuals, retailers, importers and businesses buying locally or sourcing products from verified Chinese suppliers.",
    },
  ];

  return (
    <div className="home-page relative min-h-screen">
      <SEOHead
        title="Find Products and Verified Suppliers in China"
        description="Browse wholesale products and verified suppliers in China, receive the complete landed-cost quote in Naira, and track delivery to Nigeria."
        keywords="Naitrust Market, source from China Nigeria, verified China suppliers, landed cost quote Nigeria, protected supplier order, China sourcing agents, product inspection China, customs delivery Nigeria"
        canonicalPath="/"
      />

      {/* Floating Feedback Button */}
      <FloatingFeedbackButton onNavigate={onNavigate} />

      {/* The video remains beneath a strong Naitrust-blue treatment so copy stays readable. */}
      <section
        className={`relative isolate overflow-hidden bg-[#04162f] text-white ${useHeroViewportHeight ? "xl:min-h-[94vh]" : ""}`}
      >
        <ImageWithFallback
          src={pageImages.homeHero.src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
          decoding="async"
        />
        {allowHeroVideo && (
          <video
            ref={heroVideoRef}
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
            poster={pageImages.homeHero.src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Sourcing, inspection, export and delivery journey from China to a Nigerian business"
            onPlay={() => setHeroVideoPlaying(true)}
            onPause={() => setHeroVideoPlaying(false)}
          >
            <source media="(max-width: 767px)" src={wholesaleJourneyMobileWebm} type="video/webm" />
            <source media="(max-width: 767px)" src={wholesaleJourneyMobileMp4} type="video/mp4" />
            <source src={wholesaleJourneyDesktopWebm} type="video/webm" />
            <source src={wholesaleJourneyDesktopMp4} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 -z-10 bg-[#04162f]/60 sm:bg-[#04162f]/45" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,22,47,.96)_0%,rgba(4,22,47,.78)_44%,rgba(4,22,47,.30)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[#04162f] to-transparent" />

        <div
          className={`relative z-10 mx-auto flex w-full max-w-[90rem] items-center px-4 pb-14 pt-24 sm:px-6 sm:pb-16 sm:pt-28 xl:px-8 ${useHeroViewportHeight ? "xl:min-h-[100svh] xl:py-28" : "xl:pb-24 xl:pt-32"}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-20 mx-auto min-w-0 max-w-3xl text-center xl:mx-0 xl:text-left"
          >
            <p className="mx-auto mb-2 w-fit max-w-[20rem] rounded-2xl border border-white/15 bg-white/[0.08] px-3 py-1.5 text-center text-[8px] font-semibold uppercase leading-3 tracking-[0.06em] text-white shadow-sm backdrop-blur sm:mb-3 sm:max-w-none sm:rounded-full sm:px-4 sm:py-2 sm:text-xs sm:leading-4 sm:tracking-[0.12em] xl:mx-0">
              Wholesale sourcing · Verified suppliers · Confirmed landed cost
            </p>
            <AnimatedHeroText />

            <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-2 sm:gap-3 xl:justify-start">
              <Button
                size="sm"
                onClick={() => onNavigate("/market")}
                className="group h-10 w-auto rounded-full bg-[#1e90ff] px-6 text-xs font-bold text-white shadow-[0_8px_22px_rgba(30,144,255,.24)] transition-all hover:-translate-y-0.5 hover:bg-[#42a2ff] sm:h-12 sm:px-7 sm:text-sm"
              >
                Explore wholesale products
                <ArrowRight
                  size={18}
                  className="ml-1 transition-transform group-hover:translate-x-1 sm:ml-2 sm:h-6 sm:w-6"
                />
              </Button>
              <button
                type="button"
                onClick={() => onNavigate("/login?returnTo=/app/source")}
                className="inline-flex h-10 w-auto items-center justify-center gap-1 rounded-full border border-white/20 bg-white/[0.06] px-6 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/10 sm:h-12 sm:gap-2 sm:px-7 sm:text-sm"
              >
                Find a product
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[10px] font-semibold text-white/70 sm:gap-x-5 sm:text-xs xl:mx-0 xl:justify-start">
              <span>Supplier search</span><ChevronRight size={13} />
              <span>Inspection</span><ChevronRight size={13} />
              <span>Consolidation</span><ChevronRight size={13} />
              <span>Delivery in Nigeria</span>
            </div>
          </motion.div>
        </div>
        {/* {allowHeroVideo && (
          <button
            type="button"
            onClick={() => void toggleHeroVideo()}
            className="absolute bottom-4 right-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#04162f]/70 text-white backdrop-blur transition hover:bg-[#04162f]/90 sm:bottom-6 sm:right-6"
            aria-label={heroVideoPlaying ? "Pause background video" : "Play background video"}
          >
            {heroVideoPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
        )} */}
      </section>

      {/* Clear customer/business positioning */}
      <section className="relative overflow-hidden border-b bg-background py-12 sm:py-20">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              The complete sourcing journey
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] sm:mt-4 sm:text-5xl">
              Find the right product. Know the real cost. Follow every step.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-7">
              Naitrust translates supplier information, confirms the landed
              cost, protects the product payment, coordinates logistics, and
              keeps every update in one order record.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:mt-10 lg:grid-cols-[1fr_.9fr_1fr]">
            <Card className="group rounded-3xl border-primary/10 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users size={23} />
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-primary">
                Discover
              </p>
              <h3 className="mt-2 text-xl font-bold sm:text-2xl">
                Browse products and suppliers in clear English.
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Compare specifications, minimum order quantities, source prices,
                verification and previous order activity.
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-full"
                onClick={() => onNavigate("/market")}
              >
                Explore products <ArrowRight size={15} />
              </Button>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border-0 bg-[#04162f] p-5 text-white sm:p-8">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
                <Shield size={23} />
              </span>
              <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.15em] text-sky-300">
                Confirmed quote
              </p>
              <h3 className="relative mt-2 text-xl font-bold sm:text-2xl">
                See the landed cost before you pay.
              </h3>
              <p className="relative mt-3 text-sm leading-6 text-white/70">
                Products, inspection, customs, handling, insurance and delivery
                are itemized in NGN, with the Chinese CNY source cost still
                visible.
              </p>
              <Button
                className="relative mt-6 rounded-full bg-white text-[#071b31] hover:bg-white/90"
                onClick={() => onNavigate("/market")}
              >
                Start a cart <ArrowRight size={15} />
              </Button>
            </Card>

            <Card className="group rounded-3xl border-emerald-500/15 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <Landmark size={23} />
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-emerald-600">
                Protected delivery
              </p>
              <h3 className="mt-2 text-xl font-bold sm:text-2xl">
                Follow the order until it reaches your door.
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Track supplier confirmation, inspection, export, transit,
                customs, local delivery and buyer review from one Order Room.
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-full"
                onClick={() => onNavigate("/market")}
              >
                See how orders work <ArrowRight size={15} />
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Traders and local businesses */}
      <section className="relative overflow-hidden bg-[#f3f8fc] px-4 py-12 dark:bg-[#081827] sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-[#1e90ff]/10 blur-[90px]" />
        <div className="pointer-events-none absolute -right-24 -top-20 h-96 w-96 rounded-full bg-emerald-400/10 blur-[110px]" />
        <div className="relative mx-auto grid max-w-[90rem] items-center gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className="relative min-h-[31rem] sm:min-h-[39rem]"
          >
            <div className="absolute inset-x-0 top-0 h-[25rem] overflow-hidden rounded-[1.75rem] shadow-[0_32px_85px_rgba(7,27,49,.2)] sm:right-[12%] sm:h-[34rem] sm:rounded-[2.5rem]">
              <ImageWithFallback
                src={tradersLocalBusinessesImage}
                alt="Nigerian traders reviewing a digital transaction at their local shop"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071b31]/75 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-white sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">
                  Trade with a clearer record
                </p>
                <p className="mt-2 max-w-xs text-lg font-bold leading-snug sm:text-2xl">
                  From product showcase to completed order.
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="absolute bottom-0 right-0 w-[48%] overflow-hidden rounded-[1.4rem] border-[5px] border-[#f3f8fc] bg-white shadow-2xl dark:border-[#081827] sm:w-[42%] sm:rounded-[2rem]"
            >
              <ImageWithFallback
                src={localTailoringBusinessImage}
                alt="A Nigerian tailor confirming a customer order on her phone"
                className="aspect-[4/5] w-full object-cover brightness-[1.07] contrast-[1.03] saturate-[1.06]"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#071b31]/90 to-transparent px-4 pb-4 pt-12 text-white sm:px-5 sm:pb-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-sky-200 sm:text-[10px]">
                  Local service business
                </p>
                <p className="mt-1 text-xs font-bold sm:text-sm">
                  Order confirmed
                </p>
              </div>
            </motion.div>

            <motion.div
              animate={allowAmbientMotion ? { y: [0, -7, 0] } : undefined}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-3 top-4 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-xl backdrop-blur sm:-left-5 sm:top-12 sm:p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={18} />
                </span>
                <div>
                  <p className="text-[9px] text-slate-500">
                    New customer order
                  </p>
                  <p className="text-xs font-bold text-[#071b31]">
                    Quote accepted
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Made for the way Nigeria trades
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-[1.08] tracking-[-0.045em] text-[#071b31] dark:text-white sm:text-5xl lg:text-6xl">
              Designed for traders and local businesses.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Whether you run a market stall, neighbourhood shop, workshop, or
              growing online business, Naitrust helps customers discover you,
              request quotes, and follow customer orders.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Store,
                  title: "Publish your showcase",
                  text: "Add products, services, photos, videos, minimum orders, and fulfilment details.",
                },
                {
                  icon: ReceiptText,
                  title: "Confirm customer quotes",
                  text: "Agree the price, quantity, requirements, and delivery before payment.",
                },
                {
                  icon: Shield,
                  title: "Fulfil customer orders",
                  text: "Keep terms, delivery evidence, and payment status together.",
                },
                {
                  icon: Fingerprint,
                  title: "Build supplier trust",
                  text: "Turn verified details, ratings, and completed orders into stronger history.",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-2xl border border-[#071b31]/[0.07] bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.05] sm:p-5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon size={19} />
                  </span>
                  <h3 className="mt-4 text-sm font-bold sm:text-base">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                className="h-9 rounded-full px-4 text-sm"
                onClick={() => onNavigate("register-business")}
              >
                Open a business account <ArrowRight size={15} />
              </Button>
              <Button
                variant="outline"
                className="h-9 rounded-full px-4 text-sm"
                onClick={() => onNavigate("business")}
              >
                See how it works for business
              </Button>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              Built for sole traders, shops, market sellers, wholesalers,
              artisans, and service businesses.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Customer journey */}
      <section
        id="customer-journey"
        className="bg-[#c4e9fdb3] px-4 py-12 text-[#071b31] sm:px-6 sm:py-24 lg:px-8"
      >
        <div className="mx-auto max-w-[90rem]">
          <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Customer journey
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] sm:mt-4 sm:text-5xl">
                From supplier search to delivery, without the guesswork.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-[#35546f] sm:text-lg sm:leading-7 lg:justify-self-end">
              Browse products, check the supplier, receive the complete landed
              cost, and follow the order until it reaches you.
            </p>
          </div>

          <div className="mt-10 grid overflow-hidden rounded-3xl border border-[#071b31]/10 bg-white/30 shadow-[0_18px_45px_rgba(7,49,88,.07)] backdrop-blur-sm md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Search,
                step: "01",
                title: "Discover products",
                text: "Search verified suppliers and translated product listings from China or Nigeria.",
              },
              {
                icon: Building2,
                step: "02",
                title: "Check the supplier",
                text: "Explore products, factory or shop media, fulfilment details, ratings, and the Trust Profile.",
              },
              {
                icon: ReceiptText,
                step: "03",
                title: "Confirm the full cost",
                text: "Receive an itemized quote covering products, inspection, customs, handling, and delivery.",
              },
              {
                icon: Shield,
                step: "04",
                title: "Pay and track safely",
                text: "Pay for the order and follow preparation, transit, customs, delivery, and buyer review.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="border-b border-[#071b31]/10 p-5 last:border-b-0 sm:p-7 md:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/65 text-primary shadow-sm">
                    <item.icon size={21} />
                  </span>
                  <span className="text-2xl font-black text-[#071b31]/15">
                    {item.step}
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#35546f]">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button
              className="h-9 rounded-full px-4 text-xs sm:h-10 sm:px-5 sm:text-sm"
              onClick={() => onNavigate("register-customer")}
            >
              Start as a customer <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </section>

      {/* Product pillars */}
      <section className="relative overflow-hidden bg-[#f5f8fc] px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-24 dark:bg-[#0d0f13]">
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        {/* Platform-Focused Trust Blocks */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mx-auto max-w-[90rem]"
        >
          <div className="mb-9 grid items-end gap-4 sm:mb-12 sm:gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                One trusted platform
              </p>
              <h2 className="max-w-3xl text-2xl leading-[1.08] tracking-[-0.04em] sm:text-5xl sm:leading-[1.03] lg:text-6xl naitrust-satoshi-bold">
                Sourcing should feel clear.
                <br />
                <span className="text-muted-foreground">
                  From search to doorstep.
                </span>
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground lg:justify-self-end lg:text-lg">
              Naitrust brings supplier discovery, translated listings, confirmed
              costs, protected funds, logistics, and evidence into one commerce
              flow.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
            {[
              {
                platform: "Discover Suppliers",
                kicker: "China and Nigeria",
                iconComponent: Landmark,
                description:
                  "Browse curated products, services, supplier showcases, verification, ratings, and fulfilment information.",
                gradient: "from-emerald-400 to-emerald-600",
                className: "lg:col-span-4 bg-[#09243b] text-white",
              },
              {
                platform: "Understand Every Product",
                kicker: "Clear English listings",
                iconComponent: Search,
                description:
                  "Review translated titles, specifications, variants, minimum orders, source prices, and supplier requirements.",
                gradient: "from-sky-400 to-blue-600",
                className: "lg:col-span-4 bg-white dark:bg-card",
              },
              {
                platform: "Know the Landed Cost",
                kicker: "No checkout guesswork",
                iconComponent: Send,
                description:
                  "See the product, FX, inspection, customs, handling, insurance, and delivery costs before accepting.",
                gradient: "from-blue-400 to-blue-600",
                className: "lg:col-span-4 bg-[#1e90ff] text-white",
              },
              {
                platform: "Protect Supplier Funds",
                kicker: "Pay for an order",
                iconComponent: Handshake,
                description:
                  "Keep product funds protected through the agreed order stages while logistics charges stay itemized.",
                gradient: "from-amber-400 to-orange-500",
                showAccentGlow: false,
                className: "lg:col-span-4 bg-white dark:bg-card",
              },
              {
                platform: "Track the Full Journey",
                kicker: "One Order Room",
                iconComponent: Handshake,
                description:
                  "Keep inspection, export, transit, customs, local delivery, messages, evidence, and issues on one record.",
                gradient: "from-cyan-400 to-sky-600",
                showAccentGlow: false,
                className: "lg:col-span-4 bg-white dark:bg-card",
              },
              {
                platform: "Get Help in China",
                kicker: "Verified agents",
                iconComponent: Fingerprint,
                description:
                  "Hire independent agents for supplier checks, sourcing, factory visits, negotiation, or product inspection.",
                gradient: "from-violet-400 to-indigo-600",
                showAccentGlow: false,
                className: "lg:col-span-4 bg-white dark:bg-card",
              },
            ].map((platform, index) => (
              <motion.div
                key={platform.platform}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * index }}
                whileHover={{ y: -5 }}
                className={`group relative min-h-[190px] overflow-hidden rounded-[1.5rem] border border-black/5 p-5 shadow-[0_18px_50px_rgba(11,43,69,.07)] sm:min-h-[240px] sm:rounded-[2rem] sm:p-8 lg:p-9 ${platform.className}`}
              >
                <div className="relative flex h-full flex-col">
                  <div
                    className={`mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg sm:mb-12 sm:h-12 sm:w-12 sm:rounded-2xl ${platform.gradient}`}
                  >
                    <platform.iconComponent size={23} />
                  </div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] opacity-55">
                    {platform.kicker}
                  </p>
                  <h3 className="text-xl font-bold tracking-tight sm:text-3xl">
                    {platform.platform}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 opacity-70 sm:text-base">
                    {platform.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Account capabilities */}
      <section className="relative overflow-hidden bg-[#04162f] py-12 text-white sm:py-20 lg:py-28">
        <div className="pointer-events-none absolute right-[-10%] top-[-25%] h-[34rem] w-[34rem] rounded-full" />
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mb-10 grid items-end gap-4 sm:mb-14 sm:gap-6 lg:grid-cols-2 lg:text-left"
          >
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#53b0ff]">
                One connected order account
              </p>
              <h2 className="text-2xl leading-[1.08] tracking-[-0.04em] sm:text-5xl sm:leading-[1.05]">
                Source, pay and track
                <br />
                from one place.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/60 sm:text-lg sm:leading-8 lg:justify-self-end">
              Discover suppliers, confirm the complete cost, protect product
              funds and follow delivery to Nigeria.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="relative mb-10 hidden justify-center rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-3 backdrop-blur sm:mb-16 sm:flex sm:rounded-[2rem] sm:p-8"
          >
            {allowAmbientMotion && <TrustHeroAnimation />}
          </motion.div>

          <div className="relative grid gap-0 overflow-hidden rounded-[1.5rem] border border-white/10 sm:rounded-[2rem] md:grid-cols-2 lg:grid-cols-3">
            {accountCapabilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative border-b border-white/10 p-5 last:border-b-0 sm:p-7 md:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
                >
                  <div className="h-full">
                    <div className="mb-6 flex items-center justify-between sm:mb-10">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-[#53b0ff]">
                        <Icon size={23} />
                      </div>
                      <span className="text-3xl font-black text-white/10">
                        0{item.step}
                      </span>
                    </div>
                    <h3 className="mb-3 text-lg text-white">{item.title}</h3>
                    <p className="text-sm leading-6 text-white/55">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Button
              className="h-9 rounded-full px-4 text-xs shadow-[0_10px_26px_rgba(30,144,255,.2)] sm:h-10 sm:px-5 sm:text-sm"
              onClick={openWaitlistModal}
            >
              Get Early Access
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Import account: funding, protected order balances, refunds and withdrawals */}
      <section className="bg-[#f5f8fc] py-12 dark:bg-[#0d0f13] sm:py-20 lg:py-28">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1 relative"
            >
              <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] shadow-[0_30px_80px_rgba(4,22,47,.18)]">
                <ImageWithFallback
                  src={pageImages.homeImportInspection.src}
                  alt={pageImages.homeImportInspection.alt}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Your import account
              </p>
              <h2 className="mb-4 text-2xl leading-tight tracking-[-0.04em] sm:mb-5 sm:text-5xl">
                Fund orders, receive refunds and withdraw earnings clearly.
              </h2>
              <p className="mb-7 text-sm leading-6 text-muted-foreground sm:mb-8 sm:text-lg sm:leading-relaxed">
                Use your Naitrust balance for accepted supplier quotes.
                Order payments, refundable logistics amounts and available
                money remain clearly separated.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  {
                    icon: ArrowDownToLine,
                    text: "Fund accepted supplier orders",
                  },
                  {
                    icon: Shield,
                    text: "Keep supplier and logistics payments separate",
                  },
                  {
                    icon: MessageCircle,
                    text: "Receive order refunds and adjustments",
                  },
                  {
                    icon: Landmark,
                    text: "Withdraw only to your verified bank account",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      className="flex items-center gap-3 rounded-2xl border bg-card p-4"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium">{item.text}</span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="h-9 w-auto self-start rounded-full px-4 text-xs sm:h-10 sm:px-5 sm:text-sm"
                  onClick={openWaitlistModal}
                >
                  Get Early Access
                  <ArrowRight size={14} className="ml-1" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Digital Print Highlight */}
      <section className="relative overflow-hidden bg-[#071a32] py-12 sm:py-20 lg:py-28">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-9 lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#53b0ff]">
                International Order Room
              </p>
              <h2 className="mb-4 text-2xl leading-tight tracking-[-0.04em] text-white sm:mb-5 sm:text-5xl">
                Follow your China order from supplier to doorstep.
              </h2>
              <p className="mb-7 text-sm leading-6 text-white/65 sm:mb-8 sm:text-lg sm:leading-8">
                Naitrust keeps the verified supplier, accepted quote, product
                payment, inspection, shipping documents, customs progress,
                delivery evidence and next action in one order room.
              </p>

              <div className="mb-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
                {[
                  {
                    icon: Fingerprint,
                    text: "Seller evidence and secure buyer handover kept together",
                  },
                  {
                    icon: Lock,
                    text: "Time to inspect, report a problem, or approve payment release",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.07]"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium text-white">
                        {item.text}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex">
                <Button
                  size="sm"
                  className="w-auto rounded-full px-5"
                  onClick={() => onNavigate("/market")}
                >
                  Explore China Market
                  <ArrowRight size={15} className="ml-1.5" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative min-h-[31rem] sm:min-h-[34rem]"
            >
              {allowAmbientMotion && (
                <motion.div
                  aria-hidden="true"
                  animate={{ rotate: 360, scale: [1, 1.08, 1] }}
                  transition={{
                    rotate: { duration: 28, repeat: Infinity, ease: "linear" },
                    scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className="pointer-events-none absolute -inset-8 rounded-full border border-[#53b0ff]/15"
                />
              )}
              {allowAmbientMotion && (
                <motion.div
                  aria-hidden="true"
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 38,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="pointer-events-none absolute -inset-3 rounded-[3rem] border border-dashed border-white/10"
                />
              )}
              <div className="absolute inset-x-0 top-0 h-[22rem] overflow-hidden rounded-[1.5rem] border border-white/15 shadow-[0_35px_90px_rgba(0,0,0,.4)] sm:inset-x-8 sm:h-[27rem] sm:rounded-[2rem]">
                <motion.div
                  animate={
                    allowAmbientMotion
                      ? { scale: [1, 1.045, 1], x: [0, -5, 0] }
                      : undefined
                  }
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0"
                >
                  <ImageWithFallback
                    src={saferDealsImage}
                    alt="Customer and business reviewing a protected transaction"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#04162f] via-[#04162f]/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 px-5 pb-12 pt-6 text-white sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7fc5ff]">
                    A shared record for both sides
                  </p>
                  <p className="mt-2 max-w-sm text-lg font-bold leading-snug sm:text-xl">
                    The order, evidence, payment status, and next action stay
                    together.
                  </p>
                </div>
              </div>

              <motion.div
                animate={allowAmbientMotion ? { y: [0, -8, 0] } : undefined}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-0 left-0 z-10 w-[82%] sm:w-[68%]"
              >
                <Card className="gap-0 rounded-[1.25rem] border-0 bg-white p-4 text-[#071b31] shadow-2xl sm:rounded-[1.5rem] sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <CheckCircle2 size={21} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Order update</p>
                      <p className="font-bold text-[#071b31]">
                        Delivery evidence added
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-3/4 rounded-full bg-emerald-500" />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-500">
                    <span>Terms agreed</span>
                    <span>Awaiting confirmation</span>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                animate={
                  allowAmbientMotion
                    ? { y: [0, 7, 0], rotate: [0, 0.6, 0] }
                    : undefined
                }
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6,
                }}
                className="absolute bottom-8 right-0 z-20 w-[47%] sm:bottom-10 sm:w-[38%]"
              >
                <Card className="gap-0 rounded-[1.15rem] border border-white/70 bg-white/95 p-3 shadow-2xl backdrop-blur sm:rounded-[1.4rem] sm:p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf5ff] text-primary">
                      <Shield size={17} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Payment status
                      </p>
                      <p className="text-xs font-bold text-emerald-700">
                        Protected
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="border-b bg-background py-12 sm:py-20">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Infrastructure partners
            </p>
            <h2 className="mb-4 text-2xl tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              Trust in front. Regulated infrastructure underneath.
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Payments and account services are provided through regulated
              banking infrastructure from Anchor. Naitrust provides the customer
              experience and trust workflow but does not hold customer funds.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 py-4 sm:gap-4">
            {/* <motion.a
              href="https://www.cac.gov.ng/"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * 1 }}
              className="block"
            >
              <Card className="flex h-full min-h-40 items-center justify-center rounded-[1.5rem] p-6 transition-all hover:-translate-y-1 hover:shadow-xl dark:from-card dark:to-gray-900/50">
                <CACLogo className="w-16 h-16"/>
                <p className="font-semibold text-sm text-center">CAC Nigeria</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Official Registry</p>
              </Card>
            </motion.a> */}

            <motion.a
              href="https://qoreid.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * 1 }}
              className="block"
            >
              <Card className="flex h-full min-h-32 items-center justify-center rounded-[1.25rem] p-4 transition-all hover:-translate-y-1 hover:shadow-xl sm:min-h-40 sm:rounded-[1.5rem] sm:p-6 dark:from-card dark:to-gray-900/50">
                <QoreIDLogo className="h-12 w-12 rounded-full bg-[#141414] p-2 sm:h-16 sm:w-16" />
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                  QoreID
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  Identity and business checks
                </p>
              </Card>
            </motion.a>

            <motion.a
              href="https://getanchor.co"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * 1 }}
              className="block"
            >
              <Card className="flex h-full min-h-32 items-center justify-center rounded-[1.25rem] p-4 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl sm:min-h-40 sm:rounded-[1.5rem] sm:p-6 dark:from-card dark:to-gray-900/50">
                <AnchorLogo className="h-12 w-12 rounded-full object-contain sm:h-16 sm:w-16" />
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                  Anchor
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  Payment infrastructure
                </p>
              </Card>
            </motion.a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#f5f8fc] py-12 dark:bg-[#0d0f13] sm:py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 grid gap-5 text-left md:grid-cols-[0.7fr_1fr] md:items-end"
          >
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Questions, answered
              </p>
              <h2 className="text-2xl tracking-[-0.04em] text-gray-900 sm:text-5xl dark:text-white">
                The important stuff.
              </h2>
            </div>
            <p className="text-sm leading-6 text-muted-foreground sm:text-lg md:justify-self-end">
              Clear answers about suppliers, landed-cost quotes, protected
              orders, agents, logistics, delivery, refunds, and withdrawals.
            </p>
          </motion.div>

          <div className="overflow-hidden rounded-[1.5rem] border bg-background sm:rounded-[2rem]">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="grid gap-3 border-b p-5 last:border-b-0 sm:grid-cols-[3rem_0.8fr_1.2fr] sm:gap-5 sm:p-8">
                  <span className="text-sm font-bold text-primary">
                    0{index + 1}
                  </span>
                  <h4>{faq.question}</h4>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => onNavigate("faqs")}>
              View All FAQs
              <ChevronRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA - Enhanced with Slogan */}
      <section className="relative overflow-hidden bg-[#04162f] py-10 text-white sm:pb-20 sm:pt-24">
        <div className="pointer-events-none absolute left-1/2 top-[38%] h-44 w-[38rem] max-w-[85vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[95px]" />

        <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Slogan - Prominent */}
            <div className="mb-5 inline-flex max-w-full rounded-full border border-white/15 bg-white/[0.06] px-3 py-2 backdrop-blur sm:mb-8 sm:px-5 sm:py-2.5">
              <p className="text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-[#7dc1ff] sm:text-xs sm:tracking-[0.14em]">
                Verified suppliers. Clear landed costs. Protected delivery.
              </p>
            </div>

            <h2 className="mb-4 text-2xl font-bold leading-[1.1] tracking-[-0.04em] text-white sm:mb-5 sm:text-5xl sm:leading-[1.02] lg:text-6xl">
              Find it in China.
              <br />
              Receive it in Nigeria.
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-sm leading-6 text-white/60 sm:mb-9 sm:text-base sm:leading-7 lg:text-lg">
              Browse verified suppliers in English, receive a confirmed quote,
              pay in Naira, and follow the order to your door.
            </p>

            <div className="flex flex-row justify-center gap-2 sm:gap-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => onNavigate("/market")}
                className="h-10 w-auto flex-none rounded-full bg-primary px-6 text-xs font-bold text-white ring-1 ring-white/15 hover:-translate-y-0.5 hover:bg-primary/90 sm:h-12 sm:px-8 sm:text-base"
              >
                Explore Naitrust Market
                <ArrowRight size={14} className="ml-1 sm:h-5 sm:w-5" />
              </Button>
              <Button
                size="lg"
                onClick={() =>
                  window.open(
                    "/register-business",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="h-10 w-auto flex-none rounded-full border border-white/30 bg-white/[0.1] px-6 text-xs font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur hover:-translate-y-0.5 hover:bg-white/15 hover:text-white sm:h-12 sm:px-8 sm:text-base"
              >
                Join as a Business
              </Button>
            </div>

            {/* Feedback Link */}
            <div className="mt-9 border-t border-white/10 pt-7 sm:mt-12 sm:pt-8">
              <p className="mb-3 text-sm text-white/45 sm:mb-4 sm:text-base">
                Have feedback about importing products into Nigeria?
              </p>
              <Button
                variant="ghost"
                onClick={() => onNavigate("feedback")}
                className="text-primary hover:bg-primary/10 hover:text-primary"
              >
                Share Your Feedback
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
