import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

import { ResultModal } from "@/components/ResultModal";
import { runPurchaseFlow, type VipType } from "@/services/purchase";

import "./stitch-home.css";

const symFill: CSSProperties = { fontVariationSettings: "'FILL' 1" };

const PLAN_OPTIONS: Array<{ vipType: VipType; label: string; price: number; recommended?: boolean }> = [
  { vipType: "seasonal", label: "Seasonal 季度版", price: 59 },
  { vipType: "yearly", label: "Yearly 年度版", price: 198, recommended: true },
  { vipType: "half-year", label: "Half-year 半年版", price: 109 },
  { vipType: "lifetime", label: "Lifetime 终身版", price: 498 },
];
const DEFAULT_PLAN = PLAN_OPTIONS[1]!;

export function StitchHomePage() {
  const [selectedPlan, setSelectedPlan] = useState<VipType>("yearly");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<{ code: string; orderNo: string } | null>(null);

  const currentPlan = useMemo(
    () => PLAN_OPTIONS.find((item) => item.vipType === selectedPlan) ?? DEFAULT_PLAN,
    [selectedPlan],
  );

  async function handlePurchase() {
    setErrorMessage(null);
    setIsPurchasing(true);
    try {
      // 购买流程在 service 层中按顺序执行：连通性检查 -> 抢码 -> 建单 -> 异常补偿回滚。
      const res = await runPurchaseFlow({
        vipType: currentPlan.vipType,
        amount: currentPlan.price,
      });
      if (!res.ok) {
        setErrorMessage(`${res.error.message} ${res.error.fixHint}`);
        return;
      }
      setResult({ code: res.code, orderNo: res.orderNo });
    } catch (error) {
      console.error("[stitch-home] unexpected purchase error", error);
      setErrorMessage("购买失败：出现未预期异常，请稍后重试。");
    } finally {
      setIsPurchasing(false);
    }
  }

  return (
    <div className="stitch-home-page selection:bg-primary-container selection:text-white">
      <header className="fixed top-0 z-50 w-full bg-white/80 shadow-sm backdrop-blur-xl dark:bg-slate-900/80">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tighter text-slate-900 dark:text-white">
            <span
              className="material-symbols-outlined text-primary"
              style={symFill}
            >
              bolt
            </span>
            <span>Atelier Software</span>
          </div>
          <div className="hidden items-center space-x-8 font-plus-jakarta text-sm font-medium tracking-tight md:flex">
            <a
              className="text-slate-600 transition-colors hover:text-emerald-500 dark:text-slate-400"
              href="#"
            >
              Order Inquiry
            </a>
            <a
              className="text-slate-600 transition-colors hover:text-emerald-500 dark:text-slate-400"
              href="#"
            >
              Refund Service
            </a>
            <a
              className="text-slate-600 transition-colors hover:text-emerald-500 dark:text-slate-400"
              href="#"
            >
              Online Support
            </a>
            <a
              className="border-b-2 border-emerald-500 pb-1 font-semibold text-emerald-600 dark:text-emerald-400"
              href="#"
            >
              Account Center
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="hidden font-medium text-slate-900 transition-all hover:opacity-80 dark:text-white md:block"
            >
              Sign In
            </button>
            <button
              type="button"
              className="primary-gradient scale-95 rounded-full px-6 py-2 font-bold text-white shadow-md transition-transform active:scale-90"
            >
              Get Started
            </button>
          </div>
        </nav>
        <div className="h-px bg-slate-100/50 dark:bg-slate-800/50" />
      </header>

      <main className="pb-40 pt-24 md:pb-32">
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 lg:grid-cols-12">
          <div className="group relative lg:col-span-7">
            <div className="absolute -inset-4 rounded-xl bg-primary-container/5 blur-3xl transition-all duration-700 group-hover:bg-primary-container/10" />
            <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-8 editorial-shadow">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl primary-gradient text-white shadow-lg">
                  <span className="material-symbols-outlined text-3xl">
                    phone_iphone
                  </span>
                </div>
                <div>
                  <h2 className="font-headline text-2xl font-bold tracking-tight">
                    Atelier Activation
                  </h2>
                  <p className="text-sm text-on-surface-variant opacity-60">
                    Professional iOS Utility Suite
                  </p>
                </div>
              </div>
              <img
                alt="iPhone software activation interface"
                className="h-auto w-full transform rounded-lg shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuChHijLXo0qIjd-zqM_KoMPkvx7097CgXJ_Z2uS1x0TTZfBmbZ64_ApBYT3XeIFifMWr9A0LOrkc99Qx8kfHGWqp9I4mJ61GiX0UDI-Odhqz868nDiNFfAXFYdPvM9-df2_vaa9Q0OhmRpnRdlDkyw5eYjFKUmdIQEK0zIyXXGGsaRhoGdRGJfREjOksWjUcGl1Zc3foTRAt_wlwuhIMb-b81rNi9x0ARe-9bu6WaOHw2Sni7XmH6NTegZuQ3Y26QI_xFYIgbOzUoNH"
              />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                <span
                  className="material-symbols-outlined text-sm text-primary"
                  style={symFill}
                >
                  support_agent
                </span>
                1-to-1 Human
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                <span
                  className="material-symbols-outlined text-sm text-primary"
                  style={symFill}
                >
                  bolt
                </span>
                Instant Delivery
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                <span
                  className="material-symbols-outlined text-sm text-primary"
                  style={symFill}
                >
                  verified_user
                </span>
                Secure Auth
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                <span
                  className="material-symbols-outlined text-sm text-primary"
                  style={symFill}
                >
                  assignment_return
                </span>
                Failed Refund
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                <span
                  className="material-symbols-outlined text-sm text-primary"
                  style={symFill}
                >
                  history_edu
                </span>
                Guidance
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:col-span-5">
            <div className="rounded-xl border-t-4 border-primary bg-surface-container-lowest p-10 editorial-shadow">
              <div className="mb-8">
                <span className="mb-4 inline-flex items-center rounded-full bg-primary-container/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                  Official Authorized
                </span>
                <h1 className="mb-2 font-headline text-4xl font-extrabold leading-tight tracking-tighter">
                  iPhone Software Activation
                  <br />
                  <span className="text-primary-container">Instant Delivery</span>
                </h1>
                <p className="font-medium text-on-surface-variant opacity-70">
                  官方正版授权 · 专业技术支持激活
                </p>
              </div>
              <div className="mb-8 flex items-baseline gap-2 rounded-lg bg-surface-container-low p-6">
                <span className="font-headline text-5xl font-extrabold tracking-tighter text-primary">
                  ¥{currentPlan.price}
                </span>
                <span className="text-lg font-medium text-on-surface-variant/60 line-through">
                  ¥399
                </span>
                <span className="ml-auto flex items-center gap-1 text-xs font-bold text-tertiary">
                  <span className="material-symbols-outlined text-sm">
                    local_fire_department
                  </span>
                  Limited Time
                </span>
              </div>
              <div className="mb-8 space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/50">
                  Select Activation Plan 选择方案
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PLAN_OPTIONS.map((plan) => {
                    const selected = selectedPlan === plan.vipType;
                    return (
                      <button
                        key={plan.vipType}
                        type="button"
                        onClick={() => setSelectedPlan(plan.vipType)}
                        className={
                          selected
                            ? "relative rounded-xl border-2 border-primary bg-primary-container/5 p-4 text-left"
                            : "rounded-xl border-2 border-outline-variant p-4 text-left transition-all hover:border-primary"
                        }
                      >
                        {plan.recommended ? (
                          <div className="absolute -right-2 -top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-white">
                            Recommended
                          </div>
                        ) : null}
                        <span className={selected ? "block text-sm font-bold text-primary" : "block text-sm font-bold"}>
                          {plan.label}
                        </span>
                        <span className={selected ? "text-xs text-primary/70" : "text-xs opacity-60"}>
                          ¥{plan.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {errorMessage ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center rounded-full bg-surface-container-high p-1">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-white"
                  >
                    <span className="material-symbols-outlined text-sm">
                      remove
                    </span>
                  </button>
                  <span className="px-6 font-headline text-sm font-bold">1</span>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-white"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
                <div className="text-right">
                  <div className="mb-1 flex items-center justify-end gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-container-high">
                      <div className="h-full w-[85%] bg-primary-container" />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-primary">
                      85% Left
                    </span>
                  </div>
                  <span className="text-xs font-medium text-on-surface-variant/60">
                    Limited Stock Available
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  void handlePurchase();
                }}
                disabled={isPurchasing}
                className="primary-gradient flex w-full items-center justify-center gap-3 rounded-full py-5 font-headline text-lg font-bold text-white shadow-xl shadow-primary-container/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                {isPurchasing ? "购买处理中..." : "Buy Now 立即购买"}
              </button>
            </div>
          </aside>
        </section>

        <section className="mx-auto mt-32 max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-headline text-3xl font-extrabold tracking-tighter">
              Why Choose Atelier Software?
            </h2>
            <div className="mx-auto h-1 w-12 rounded-full bg-primary-container" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "verified",
                title: "Years of Operation",
                text: "多年老店深耕软件激活领域，信誉保证，累计服务超十万用户。",
              },
              {
                icon: "diversity_3",
                title: "Human Support",
                text: "拒绝冰冷机器人。全天候真人客服，1对1远程指导，解决所有安装难题。",
              },
              {
                icon: "security",
                title: "Secure Activation",
                text: "官方正规渠道，绝无风险账号，保护隐私数据，确保手机系统安全稳定。",
              },
              {
                icon: "auto_graph",
                title: "Stable Service",
                text: "激活后支持系统升级，无掉线烦恼，提供长效售后维保服务。",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="group rounded-xl bg-surface-container-lowest p-10 editorial-shadow transition-transform hover:-translate-y-2"
              >
                <div className="stitch-trust-icon mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high text-primary transition-all">
                  <span className="material-symbols-outlined text-3xl">
                    {card.icon}
                  </span>
                </div>
                <h3 className="mb-2 font-headline text-lg font-bold">{card.title}</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-32 max-w-7xl px-6">
          <div className="grid h-auto grid-cols-1 gap-6 md:h-[600px] md:grid-cols-12 md:grid-rows-2">
            <div className="group relative overflow-hidden rounded-xl bg-primary p-12 text-white md:col-span-8">
              <div className="relative z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-primary-fixed">
                  Innovation
                </span>
                <h2 className="mb-6 mt-4 font-headline text-4xl font-extrabold leading-tight">
                  Latest iOS Support
                  <br />
                  全面支持最新系统
                </h2>
                <p className="max-w-md text-primary-fixed/80">
                  我们始终紧跟苹果系统更新步伐，不论是公测版还是正式版，均可实现秒级适配激活，让您抢先体验新功能。
                </p>
              </div>
              <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-primary-container/20 blur-3xl transition-transform duration-1000 group-hover:scale-150" />
              <span className="material-symbols-outlined absolute bottom-12 right-12 text-9xl opacity-10">
                update
              </span>
            </div>
            <div className="flex flex-col justify-between rounded-xl bg-surface-container-high p-10 md:col-span-4">
              <div>
                <span className="material-symbols-outlined mb-4 text-4xl text-primary">
                  group_add
                </span>
                <h3 className="font-headline text-xl font-bold">Multi-account</h3>
                <p className="mt-2 text-sm text-on-surface-variant opacity-70">
                  支持多账号同时管理，轻松切换。
                </p>
              </div>
              <div className="border-t border-outline-variant/30 pt-6">
                <span className="font-headline text-2xl font-bold">Infinite</span>
                <p className="text-xs font-bold uppercase tracking-widest opacity-40">
                  Capability
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-between rounded-xl bg-white p-10 editorial-shadow md:col-span-4">
              <div>
                <span className="material-symbols-outlined mb-4 text-4xl text-primary">
                  flash_on
                </span>
                <h3 className="font-headline text-xl font-bold">Easy Activation</h3>
                <p className="mt-2 text-sm text-on-surface-variant opacity-70">
                  三步极简流程，告别复杂代码。
                </p>
              </div>
            </div>
            <div className="group flex items-center gap-12 rounded-xl bg-tertiary-container/30 p-12 md:col-span-8">
              <div className="flex-1">
                <h3 className="mb-4 font-headline text-2xl font-bold">
                  Data Safety & Privacy
                </h3>
                <p className="leading-relaxed text-on-surface-variant">
                  您的隐私是我们的首要任务。激活过程无需上传任何手机核心数据，100%本地加密处理。
                </p>
              </div>
              <div className="hidden h-32 w-32 rounded-full border-4 border-white p-6 editorial-shadow transition-transform group-hover:rotate-12 md:block">
                <span className="material-symbols-outlined text-6xl text-tertiary">
                  shield_person
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-32 max-w-7xl px-6">
          <div className="flex flex-col items-center gap-12 rounded-xl border-2 border-white bg-surface-container-low p-8 editorial-shadow md:flex-row md:p-16">
            <div className="flex-1">
              <h2 className="mb-4 font-headline text-3xl font-extrabold tracking-tight">
                担心不会操作？新手专属 1对1 引导
              </h2>
              <p className="mb-8 text-lg text-on-surface-variant opacity-70">
                我们的资深技术专家将通过远程或图文，手把手带您完成激活。即使是电脑小白也能在
                5 分钟内上手。
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full bg-on-surface px-8 py-4 font-bold text-white transition-all hover:opacity-90"
                >
                  <span className="material-symbols-outlined">forum</span>
                  Contact Expert 客服在线
                </button>
                <button
                  type="button"
                  className="rounded-full border border-outline-variant bg-white px-8 py-4 font-bold text-on-surface transition-all hover:bg-surface-container-high"
                >
                  View Guide 查看教程
                </button>
              </div>
            </div>
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-4 aspect-square rounded-full bg-primary-container/10 blur-2xl" />
              <img
                alt="Support Agent"
                className="relative z-10 h-auto w-full rounded-xl shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWzKCVQaJAWFKT-FgWGePPVA7sMsx4JOYF10Ug1LNEXU54xOTzEAkmaM5K85pb0fOQvQiURKwxousE-_6vN9h9MYgkki58W66Di5s_2sz9hwAlsXG84LEyHI9rJJcV46cTguNzgxi7zAIRnelsO20n3IlDS2QOUOG-MUSPfa-ua-iE_E3igkM7e0DFyxgLUijCRMIlrY5gfQBtlQUWtb0TmVF9oK-lZoiKShNoHi9YBNMKWPXB1KhSy2UfENwZAhgRavrFaA-rmDKo"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto mt-32 max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-headline text-3xl font-extrabold tracking-tighter">
              Simple 4-Step Process
            </h2>
            <p className="font-medium text-on-surface-variant opacity-60">
              极简四步，快速开启高效率体验
            </p>
          </div>
          <div className="relative flex flex-col justify-between gap-8 md:flex-row">
            <div className="absolute left-0 top-12 -z-10 hidden h-px w-full bg-outline-variant/30 md:block" />
            {[
              {
                n: "1",
                title: "Payment",
                desc: "选择合适套餐完成支付",
                highlight: false,
              },
              {
                n: "2",
                title: "Receive Code",
                desc: "5秒内自动发送激活码",
                highlight: false,
              },
              {
                n: "3",
                title: "Contact Support",
                desc: "如有疑问联系技术引导",
                highlight: false,
              },
              {
                n: "4",
                title: "Success",
                desc: "激活成功享受完整功能",
                highlight: true,
              },
            ].map((step) => (
              <div
                key={step.n}
                className="flex flex-1 flex-col items-center text-center"
              >
                <div
                  className={
                    step.highlight
                      ? "primary-gradient mb-6 flex h-24 w-24 items-center justify-center rounded-full font-headline text-3xl font-bold text-white shadow-lg shadow-primary-container/30"
                      : "mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-surface-container-low bg-white font-headline text-3xl font-bold text-primary editorial-shadow"
                  }
                >
                  {step.n}
                </div>
                <h4
                  className={
                    step.highlight ? "mb-2 font-bold text-primary" : "mb-2 font-bold"
                  }
                >
                  {step.title}
                </h4>
                <p className="text-sm text-on-surface-variant opacity-60">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-32 max-w-4xl px-6">
          <h2 className="mb-12 text-center font-headline text-3xl font-extrabold tracking-tighter">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-outline-variant/20 bg-white shadow-sm">
              <button
                type="button"
                className="flex w-full items-center justify-between p-6 text-left transition-all hover:bg-surface-container-low"
              >
                <span className="font-bold">激活后会影响我的 Apple ID 账号安全吗？</span>
                <span className="material-symbols-outlined text-primary">
                  expand_more
                </span>
              </button>
              <div className="border-t border-outline-variant/10 p-6 pt-0 text-sm leading-relaxed text-on-surface-variant">
                完全不会。我们的激活技术采用官方标准接口，不涉及修改 Apple ID
                核心设置，100% 保证账号主权与安全性。
              </div>
            </div>
            {[
              "如果激活失败，可以退款吗？",
              "什么是退款政策？",
              "是否支持最新的 iOS 17 / 18 系统？",
              "安装操作难度大吗？",
            ].map((q) => (
              <div
                key={q}
                className="overflow-hidden rounded-xl border border-outline-variant/20 bg-white shadow-sm"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between p-6 text-left transition-all hover:bg-surface-container-low"
                >
                  <span className="font-bold">{q}</span>
                  <span className="material-symbols-outlined text-primary">
                    expand_more
                  </span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-10 right-10 z-50 flex flex-col gap-4 max-md:bottom-24">
        <button
          type="button"
          className="flex h-16 w-16 items-center justify-center rounded-full border border-outline-variant/20 bg-white text-on-surface editorial-shadow transition-all hover:-translate-y-1"
        >
          <span className="material-symbols-outlined">headset_mic</span>
        </button>
        <button
          type="button"
          className="primary-gradient flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl shadow-primary-container/40 transition-all hover:scale-110 active:scale-95"
        >
          <span className="material-symbols-outlined" style={symFill}>
            sms
          </span>
        </button>
      </div>

      <div className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-between gap-4 border-t border-slate-100 bg-white/90 p-4 backdrop-blur-lg md:hidden">
        <div className="flex-shrink-0">
          <span className="block text-xs font-bold text-on-surface-variant">
            Yearly Plan
          </span>
          <span className="font-headline text-xl font-bold text-primary">
            ¥{currentPlan.price}.00
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            void handlePurchase();
          }}
          disabled={isPurchasing}
          className="primary-gradient flex-1 rounded-xl py-3 text-sm font-bold tracking-wide text-white shadow-lg"
        >
          {isPurchasing ? "处理中..." : "立即购买 Buy Now"}
        </button>
      </div>

      <footer className="border-t border-outline-variant/10 bg-surface-container px-6 py-20 text-on-surface-variant">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-6 flex items-center gap-2 text-2xl font-bold tracking-tighter text-slate-900">
              <span
                className="material-symbols-outlined text-primary"
                style={symFill}
              >
                bolt
              </span>
              Atelier
            </div>
            <p className="text-sm leading-relaxed opacity-60">
              Atelier Software 是全球领先的 iOS
              生产力工具授权商，致力于通过卓越的技术与真诚的服务，为每一位用户解锁极致的数字体验。
            </p>
          </div>
          <div>
            <h5 className="mb-6 font-bold text-on-surface">Product</h5>
            <ul className="space-y-4 text-sm">
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Software Features
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Release Notes
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="mb-6 font-bold text-on-surface">Service</h5>
            <ul className="space-y-4 text-sm">
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Activation Guide
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Refund Policy
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="#">
                  Order Inquiry
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="mb-6 font-bold text-on-surface">Contact</h5>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">mail</span>
                support@atelier.com
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">schedule</span>
                09:00 - 22:00 (CST)
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-20 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-outline-variant/10 pt-8 text-xs font-medium uppercase tracking-widest opacity-40 md:flex-row">
          <p>© 2024 Atelier Software. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <Link
              to="/"
              className="normal-case tracking-normal text-primary opacity-100 hover:underline"
            >
              返回发码系统首页
            </Link>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
      <ResultModal
        open={Boolean(result)}
        title="购买成功"
        description="兑换码已发放，请妥善保存。"
        code={result?.code}
        orderNo={result?.orderNo}
        onClose={() => setResult(null)}
      />
    </div>
  );
}
