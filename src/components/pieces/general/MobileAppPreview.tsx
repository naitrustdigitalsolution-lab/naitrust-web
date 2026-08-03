import {
  Activity,
  ArrowDownToLine,
  Bell,
  Copy,
  Eye,
  Home,
  ScanLine,
  Send,
  Shield,
  UserRound,
} from 'lucide-react';

const actions = [
  { label: 'Send', icon: Send },
  { label: 'Receive', icon: ArrowDownToLine },
  { label: 'Protect', icon: Shield },
  { label: 'Pay', icon: ScanLine },
];

const activity = [
  { name: 'Kemi Adewale', detail: 'Money received · Today', amount: '+₦45,000', tone: 'emerald', icon: ArrowDownToLine },
  { name: 'Ayo Stores', detail: 'Protected payment · Yesterday', amount: '₦86,500', tone: 'blue', icon: Shield },
  { name: 'Fresh Farm Foods', detail: 'Transfer sent · 28 Jul', amount: '−₦18,200', tone: 'orange', icon: Send },
];

export function MobileAppPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[25rem] px-5 pb-10 pt-6 [perspective:1200px]">
      <div className="absolute inset-2 rounded-[3.5rem] bg-primary/20 blur-3xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-[3rem] border-[10px] border-[#080b10] bg-[#f4f7fb] shadow-[18px_38px_80px_rgba(4,22,47,.32),inset_0_0_0_1px_rgba(255,255,255,.15)] transition-transform duration-500 [transform:rotateY(-7deg)_rotateZ(-3deg)] hover:[transform:rotateY(-3deg)_rotateZ(-1deg)_translateY(-6px)]">
        <div className="flex items-center justify-between bg-[#f4f7fb] px-5 py-2 text-[9px] font-bold text-[#071a32]">
          <span>11:21</span>
          <span className="h-4 w-20 rounded-full bg-black shadow-inner" aria-label="Dynamic Island" />
          <span>●  Wi-Fi  82%</span>
        </div>

        <div className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Good morning,</p>
              <p className="text-[1.65rem] font-black tracking-[-0.04em] text-[#071a32]">Amara</p>
            </div>
            <button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#071a32] shadow-sm">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
          </div>

          <div className="relative mt-5 overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#06254e] to-[#0d4c96] p-5 text-white shadow-lg">
            <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full border-[28px] border-white/[0.04]" />
            <div className="relative flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-200">Total balance</p>
              <Eye size={17} className="text-blue-200" />
            </div>
            <p className="relative mt-5 text-[2rem] font-black tracking-[-0.05em]">₦482,650<span className="text-xl text-blue-200">.00</span></p>
            <div className="relative mt-10 flex items-end justify-between">
              <div>
                <p className="text-[10px] text-blue-200">Naitrust account</p>
                <p className="mt-1 text-sm font-bold tracking-[0.12em]">012 884 2193</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><Copy size={16} /></span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2">
            {actions.map(({ label, icon: Icon }) => (
              <div key={label} className="text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0965c7] shadow-sm"><Icon size={19} /></span>
                <span className="mt-1.5 block text-[10px] font-bold text-slate-700">{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-emerald-50 p-3 text-[#083c32]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600"><Shield size={19} fill="currentColor" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-emerald-600">Protected payment</p>
              <p className="truncate text-xs font-bold">Ayo Stores is ready for review</p>
              <p className="truncate text-[9px] text-slate-500">Delivery evidence has been uploaded.</p>
            </div>
            <span className="text-lg">→</span>
          </div>

          <div className="mb-2 mt-5 flex items-center justify-between">
            <h3 className="text-base font-black text-[#071a32]">Recent activity</h3>
            <span className="text-[10px] font-bold text-primary">View all</span>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white px-3 shadow-sm">
            {activity.map(({ name, detail, amount, tone, icon: Icon }) => (
              <div key={name} className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' : tone === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}><Icon size={17} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-[#071a32]">{name}</p>
                  <p className="truncate text-[9px] text-slate-400">{detail}</p>
                </div>
                <p className={`text-[10px] font-bold ${amount.startsWith('+') ? 'text-emerald-600' : 'text-[#071a32]'}`}>{amount}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 border-t border-slate-100 bg-white px-3 pb-3 pt-2 text-center text-[8px] font-bold text-slate-400">
          {[{ label: 'Home', icon: Home }, { label: 'Payments', icon: Send }, { label: 'Protected', icon: Shield }, { label: 'Activity', icon: Activity }, { label: 'Profile', icon: UserRound }].map(({ label, icon: Icon }, index) => (
            <span key={label} className={index === 0 ? 'text-primary' : ''}><Icon size={17} className="mx-auto mb-1" fill={index === 0 ? 'currentColor' : 'none'} />{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
