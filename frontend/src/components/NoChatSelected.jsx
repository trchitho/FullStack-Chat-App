import { MessageSquare } from "lucide-react";
import { useLanguageStore } from "../store/useLanguageStore";
import { t } from "../lib/i18n";

const NoChatSelected = () => {
  const language = useLanguageStore((state) => state.language);

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col items-center justify-center overflow-hidden bg-base-100/50 p-4 text-center sm:p-8 lg:p-16">
      <div className="w-full max-w-md space-y-5 sm:space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="flex size-14 rounded-2xl bg-primary/10 sm:size-16
             justify-center animate-bounce"
            >
              <MessageSquare className="size-7 text-primary sm:size-8" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-[clamp(1.8rem,7vw,3rem)] font-bold leading-tight">{t(language, "welcome")}</h2>
        <p className="mx-auto max-w-sm text-[clamp(0.95rem,3.5vw,1.2rem)] leading-relaxed text-base-content/60">
          {t(language, "selectConversation")}
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
