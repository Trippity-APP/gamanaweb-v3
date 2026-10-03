import { forwardRef, type ComponentType, type SVGProps } from "react";
import type { IconWeight } from "@phosphor-icons/react";
import {
  ArrowDown as PhArrowDown,
  ArrowLeft as PhArrowLeft,
  ArrowRight as PhArrowRight,
  ArrowSquareOut as PhArrowSquareOut,
  ArrowUpRight as PhArrowUpRight,
  ArrowsClockwise as PhArrowsClockwise,
  Bank as PhBank,
  Bed as PhBed,
  BookBookmark as PhBookBookmark,
  BookOpen as PhBookOpen,
  BookmarkSimple as PhBookmarkSimple,
  Books as PhBooks,
  Brain as PhBrain,
  Briefcase as PhBriefcase,
  Buildings as PhBuildings,
  CalendarBlank as PhCalendarBlank,
  CaretDown as PhCaretDown,
  CaretLeft as PhCaretLeft,
  CaretRight as PhCaretRight,
  CaretUp as PhCaretUp,
  ChartBar as PhChartBar,
  ChatCenteredText as PhChatCenteredText,
  ChatCircle as PhChatCircle,
  ChatText as PhChatText,
  Check as PhCheck,
  CheckCircle as PhCheckCircle,
  Circle as PhCircle,
  CircleNotch as PhCircleNotch,
  Clock as PhClock,
  CloudArrowDown as PhCloudArrowDown,
  Compass as PhCompass,
  Cookie as PhCookie,
  Cpu as PhCpu,
  CreditCard as PhCreditCard,
  Crosshair as PhCrosshair,
  CurrencyDollar as PhCurrencyDollar,
  DeviceMobile as PhDeviceMobile,
  DotOutline as PhDotOutline,
  DotsSixVertical as PhDotsSixVertical,
  DotsThree as PhDotsThree,
  DownloadSimple as PhDownloadSimple,
  Envelope as PhEnvelope,
  Eye as PhEye,
  FacebookLogo as PhFacebookLogo,
  FileText as PhFileText,
  Footprints as PhFootprints,
  ForkKnife as PhForkKnife,
  Funnel as PhFunnel,
  Gear as PhGear,
  Gift as PhGift,
  Globe as PhGlobe,
  GlobeHemisphereEast as PhGlobeHemisphereEast,
  HandWaving as PhHandWaving,
  Handshake as PhHandshake,
  Headphones as PhHeadphones,
  Heart as PhHeart,
  House as PhHouse,
  InstagramLogo as PhInstagramLogo,
  Lightbulb as PhLightbulb,
  Lightning as PhLightning,
  LinkedinLogo as PhLinkedinLogo,
  List as PhList,
  Lock as PhLock,
  MagicWand as PhMagicWand,
  MagnifyingGlass as PhMagnifyingGlass,
  MapPin as PhMapPin,
  MapPinArea as PhMapPinArea,
  MapPinLine as PhMapPinLine,
  MapTrifold as PhMapTrifold,
  Medal as PhMedal,
  Microphone as PhMicrophone,
  MicrophoneStage as PhMicrophoneStage,
  Minus as PhMinus,
  MusicNotes as PhMusicNotes,
  NavigationArrow as PhNavigationArrow,
  PaperPlaneTilt as PhPaperPlaneTilt,
  Path as PhPath,
  Pause as PhPause,
  PenNib as PhPenNib,
  PencilLine as PhPencilLine,
  PencilSimple as PhPencilSimple,
  Percent as PhPercent,
  Phone as PhPhone,
  Play as PhPlay,
  PlayCircle as PhPlayCircle,
  Plus as PhPlus,
  QrCode as PhQrCode,
  Quotes as PhQuotes,
  Radio as PhRadio,
  Robot as PhRobot,
  SealPercent as PhSealPercent,
  ShareNetwork as PhShareNetwork,
  Shield as PhShield,
  ShieldCheck as PhShieldCheck,
  ShoppingBag as PhShoppingBag,
  SignIn as PhSignIn,
  SignOut as PhSignOut,
  Sparkle as PhSparkle,
  SpeakerHigh as PhSpeakerHigh,
  Star as PhStar,
  Storefront as PhStorefront,
  Tag as PhTag,
  Target as PhTarget,
  ThumbsUp as PhThumbsUp,
  Ticket as PhTicket,
  Translate as PhTranslate,
  TrendUp as PhTrendUp,
  UploadSimple as PhUploadSimple,
  User as PhUser,
  Users as PhUsers,
  UsersThree as PhUsersThree,
  Wallet as PhWallet,
  Warning as PhWarning,
  WarningCircle as PhWarningCircle,
  WifiSlash as PhWifiSlash,
  X as PhX,
  XLogo as PhXLogo,
  YoutubeLogo as PhYoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";

export type { IconWeight };

export type IconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  size?: number | string;
  weight?: IconWeight;
  color?: string;
  mirrored?: boolean;
  /** Lucide-era props, accepted and ignored so existing call sites keep compiling. */
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
};

export type LucideIcon = ComponentType<IconProps>;
export type LucideProps = IconProps;

type PhosphorComponent = ComponentType<Omit<IconProps, "strokeWidth" | "absoluteStrokeWidth"> & { ref?: unknown }>;

/**
 * Phosphor glyphs behind the lucide names the site already uses. UI icons default to the
 * bold weight; a `fill-*` utility (e.g. filled stars, play buttons) switches to the solid weight.
 */
function wrap(Icon: PhosphorComponent, name: string) {
  const Wrapped = forwardRef<SVGSVGElement, IconProps>(function Wrapped(
    { weight, strokeWidth: _strokeWidth, absoluteStrokeWidth: _absolute, className, size = 24, ...rest },
    ref
  ) {
    const solid = !!className && /(^|\s)fill-(?!none)/.test(className);
    return <Icon ref={ref} weight={weight ?? (solid ? "fill" : "bold")} size={size} className={className} {...rest} />;
  });
  Wrapped.displayName = name;
  return Wrapped;
}

// No `Coins` export: Gamana Coins always use <GamanaCoinIcon />.
export const AlertCircle = wrap(PhWarningCircle as PhosphorComponent, "AlertCircle");
export const AlertTriangle = wrap(PhWarning as PhosphorComponent, "AlertTriangle");
export const ArrowDown = wrap(PhArrowDown as PhosphorComponent, "ArrowDown");
export const ArrowLeft = wrap(PhArrowLeft as PhosphorComponent, "ArrowLeft");
export const ArrowRight = wrap(PhArrowRight as PhosphorComponent, "ArrowRight");
export const ArrowUpRight = wrap(PhArrowUpRight as PhosphorComponent, "ArrowUpRight");
export const Award = wrap(PhMedal as PhosphorComponent, "Award");
export const BadgePercent = wrap(PhSealPercent as PhosphorComponent, "BadgePercent");
export const BookMarked = wrap(PhBookBookmark as PhosphorComponent, "BookMarked");
export const BookOpen = wrap(PhBookOpen as PhosphorComponent, "BookOpen");
export const Bookmark = wrap(PhBookmarkSimple as PhosphorComponent, "Bookmark");
export const Bot = wrap(PhRobot as PhosphorComponent, "Bot");
export const Brain = wrap(PhBrain as PhosphorComponent, "Brain");
export const Briefcase = wrap(PhBriefcase as PhosphorComponent, "Briefcase");
export const Building2 = wrap(PhBuildings as PhosphorComponent, "Building2");
export const Calendar = wrap(PhCalendarBlank as PhosphorComponent, "Calendar");
export const ChartBar = wrap(PhChartBar as PhosphorComponent, "ChartBar");
export const Check = wrap(PhCheck as PhosphorComponent, "Check");
export const CheckCircle2 = wrap(PhCheckCircle as PhosphorComponent, "CheckCircle2");
export const ChevronDown = wrap(PhCaretDown as PhosphorComponent, "ChevronDown");
export const ChevronLeft = wrap(PhCaretLeft as PhosphorComponent, "ChevronLeft");
export const ChevronRight = wrap(PhCaretRight as PhosphorComponent, "ChevronRight");
export const ChevronUp = wrap(PhCaretUp as PhosphorComponent, "ChevronUp");
export const Circle = wrap(PhCircle as PhosphorComponent, "Circle");
export const CircleCheck = wrap(PhCheckCircle as PhosphorComponent, "CircleCheck");
export const CirclePlay = wrap(PhPlayCircle as PhosphorComponent, "CirclePlay");
export const Clock = wrap(PhClock as PhosphorComponent, "Clock");
export const CloudDownload = wrap(PhCloudArrowDown as PhosphorComponent, "CloudDownload");
export const Compass = wrap(PhCompass as PhosphorComponent, "Compass");
export const Cookie = wrap(PhCookie as PhosphorComponent, "Cookie");
export const Cpu = wrap(PhCpu as PhosphorComponent, "Cpu");
export const CreditCard = wrap(PhCreditCard as PhosphorComponent, "CreditCard");
export const DollarSign = wrap(PhCurrencyDollar as PhosphorComponent, "DollarSign");
export const Dot = wrap(PhDotOutline as PhosphorComponent, "Dot");
export const Download = wrap(PhDownloadSimple as PhosphorComponent, "Download");
export const Edit3 = wrap(PhPencilLine as PhosphorComponent, "Edit3");
export const ExternalLink = wrap(PhArrowSquareOut as PhosphorComponent, "ExternalLink");
export const Eye = wrap(PhEye as PhosphorComponent, "Eye");
export const Facebook = wrap(PhFacebookLogo as PhosphorComponent, "Facebook");
export const FileText = wrap(PhFileText as PhosphorComponent, "FileText");
export const Filter = wrap(PhFunnel as PhosphorComponent, "Filter");
export const Footprints = wrap(PhFootprints as PhosphorComponent, "Footprints");
export const Gift = wrap(PhGift as PhosphorComponent, "Gift");
export const Globe = wrap(PhGlobe as PhosphorComponent, "Globe");
export const Globe2 = wrap(PhGlobeHemisphereEast as PhosphorComponent, "Globe2");
export const GripVertical = wrap(PhDotsSixVertical as PhosphorComponent, "GripVertical");
export const Hand = wrap(PhHandWaving as PhosphorComponent, "Hand");
export const Handshake = wrap(PhHandshake as PhosphorComponent, "Handshake");
export const Headphones = wrap(PhHeadphones as PhosphorComponent, "Headphones");
export const Heart = wrap(PhHeart as PhosphorComponent, "Heart");
export const Home = wrap(PhHouse as PhosphorComponent, "Home");
export const Hotel = wrap(PhBed as PhosphorComponent, "Hotel");
export const Instagram = wrap(PhInstagramLogo as PhosphorComponent, "Instagram");
export const Landmark = wrap(PhBank as PhosphorComponent, "Landmark");
export const Languages = wrap(PhTranslate as PhosphorComponent, "Languages");
export const Library = wrap(PhBooks as PhosphorComponent, "Library");
export const Lightbulb = wrap(PhLightbulb as PhosphorComponent, "Lightbulb");
export const Linkedin = wrap(PhLinkedinLogo as PhosphorComponent, "Linkedin");
export const Loader2 = wrap(PhCircleNotch as PhosphorComponent, "Loader2");
export const Locate = wrap(PhCrosshair as PhosphorComponent, "Locate");
export const Lock = wrap(PhLock as PhosphorComponent, "Lock");
export const LogIn = wrap(PhSignIn as PhosphorComponent, "LogIn");
export const LogOut = wrap(PhSignOut as PhosphorComponent, "LogOut");
export const Mail = wrap(PhEnvelope as PhosphorComponent, "Mail");
export const Map = wrap(PhMapTrifold as PhosphorComponent, "Map");
export const MapPin = wrap(PhMapPin as PhosphorComponent, "MapPin");
export const MapPinOff = wrap(PhMapPinLine as PhosphorComponent, "MapPinOff");
export const MapPinned = wrap(PhMapPinArea as PhosphorComponent, "MapPinned");
export const Menu = wrap(PhList as PhosphorComponent, "Menu");
export const MessageCircle = wrap(PhChatCircle as PhosphorComponent, "MessageCircle");
export const MessageSquare = wrap(PhChatText as PhosphorComponent, "MessageSquare");
export const MessageSquarePlus = wrap(PhChatCenteredText as PhosphorComponent, "MessageSquarePlus");
export const Mic = wrap(PhMicrophone as PhosphorComponent, "Mic");
export const Mic2 = wrap(PhMicrophoneStage as PhosphorComponent, "Mic2");
export const Minus = wrap(PhMinus as PhosphorComponent, "Minus");
export const MoreHorizontal = wrap(PhDotsThree as PhosphorComponent, "MoreHorizontal");
export const Music2 = wrap(PhMusicNotes as PhosphorComponent, "Music2");
export const Navigation = wrap(PhNavigationArrow as PhosphorComponent, "Navigation");
export const Pause = wrap(PhPause as PhosphorComponent, "Pause");
export const PenTool = wrap(PhPenNib as PhosphorComponent, "PenTool");
export const Pencil = wrap(PhPencilSimple as PhosphorComponent, "Pencil");
export const Percent = wrap(PhPercent as PhosphorComponent, "Percent");
export const Phone = wrap(PhPhone as PhosphorComponent, "Phone");
export const Play = wrap(PhPlay as PhosphorComponent, "Play");
export const PlayCircle = wrap(PhPlayCircle as PhosphorComponent, "PlayCircle");
export const Plus = wrap(PhPlus as PhosphorComponent, "Plus");
export const QrCode = wrap(PhQrCode as PhosphorComponent, "QrCode");
export const Quote = wrap(PhQuotes as PhosphorComponent, "Quote");
export const Radio = wrap(PhRadio as PhosphorComponent, "Radio");
export const RefreshCw = wrap(PhArrowsClockwise as PhosphorComponent, "RefreshCw");
export const Route = wrap(PhPath as PhosphorComponent, "Route");
export const Search = wrap(PhMagnifyingGlass as PhosphorComponent, "Search");
export const Send = wrap(PhPaperPlaneTilt as PhosphorComponent, "Send");
export const Settings = wrap(PhGear as PhosphorComponent, "Settings");
export const Share2 = wrap(PhShareNetwork as PhosphorComponent, "Share2");
export const Shield = wrap(PhShield as PhosphorComponent, "Shield");
export const ShieldCheck = wrap(PhShieldCheck as PhosphorComponent, "ShieldCheck");
export const ShoppingBag = wrap(PhShoppingBag as PhosphorComponent, "ShoppingBag");
export const Smartphone = wrap(PhDeviceMobile as PhosphorComponent, "Smartphone");
export const Sparkles = wrap(PhSparkle as PhosphorComponent, "Sparkles");
export const Star = wrap(PhStar as PhosphorComponent, "Star");
export const Stars = wrap(PhSparkle as PhosphorComponent, "Stars");
export const Store = wrap(PhStorefront as PhosphorComponent, "Store");
export const Tag = wrap(PhTag as PhosphorComponent, "Tag");
export const Target = wrap(PhTarget as PhosphorComponent, "Target");
export const ThumbsUp = wrap(PhThumbsUp as PhosphorComponent, "ThumbsUp");
export const Ticket = wrap(PhTicket as PhosphorComponent, "Ticket");
export const TrendingUp = wrap(PhTrendUp as PhosphorComponent, "TrendingUp");
export const Twitter = wrap(PhXLogo as PhosphorComponent, "Twitter");
export const Upload = wrap(PhUploadSimple as PhosphorComponent, "Upload");
export const User = wrap(PhUser as PhosphorComponent, "User");
export const Users = wrap(PhUsers as PhosphorComponent, "Users");
export const Users2 = wrap(PhUsersThree as PhosphorComponent, "Users2");
export const Utensils = wrap(PhForkKnife as PhosphorComponent, "Utensils");
export const Volume2 = wrap(PhSpeakerHigh as PhosphorComponent, "Volume2");
export const Wallet = wrap(PhWallet as PhosphorComponent, "Wallet");
export const Wand2 = wrap(PhMagicWand as PhosphorComponent, "Wand2");
export const WifiOff = wrap(PhWifiSlash as PhosphorComponent, "WifiOff");
export const X = wrap(PhX as PhosphorComponent, "X");
export const Youtube = wrap(PhYoutubeLogo as PhosphorComponent, "Youtube");
export const Zap = wrap(PhLightning as PhosphorComponent, "Zap");
