import { useApp } from "../context/AppContext";
import type { FeedbackType } from "../types";

export function FeedbackPanel() {
  const { state, submitFeedback, dispatch } = useApp();

  const handleFeedback = async (feedback: FeedbackType) => {
    await submitFeedback(feedback);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-slide-in">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-deep-brown">Gimana Rasanya?</h2>
        <p className="text-muted font-medium mt-1">
          Pilih satu. Resep berikutnya kita sesuaikan.
        </p>
        <div className="mt-3 alert-info text-left">
          <p className="font-semibold mb-1">Biar gampang mbedain:</p>
          <p className="text-sm">
            <span className="font-bold text-deep-brown">ASAM</span> = kurang diekstrak. Gilingan kegindahan, atau air kurang panas.
          </p>
          <p className="text-sm mt-1">
            <span className="font-bold text-deep-brown">PAHIT</span> = kebanyakan diekstrak. Gilingan kehalusan, atau air kepanasan.
          </p>
        </div>
      </div>

      {state.error && (
        <div className="alert-error" role="alert" aria-live="polite">{state.error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FeedbackButton
          feedback="SOUR"
          icon="🍋"
          iconLabel="Lemon"
          title="Kegasaman"
          desc="Asemnya nyeger, badan kopinya tipis. Kayak makan lemon mentah."
          fix="Gilingan lebih halus, air lebih panas"
          disabled={state.isLoading}
          onClick={() => handleFeedback("SOUR")}
        />
        <FeedbackButton
          feedback="BITTER"
          icon="☕"
          iconLabel="Cangkir kopi pahit"
          title="Kepahitan"
          desc="Paitnya ngerangkut di tenggorokan. Kayak teh celup kelamaan."
          fix="Gilingan lebih kasar, air lebih dingin"
          disabled={state.isLoading}
          onClick={() => handleFeedback("BITTER")}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => dispatch({ type: "SET_PHASE", phase: "recipe" })}
          className="btn-secondary"
        >
          Lewati
        </button>
        <button onClick={() => dispatch({ type: "RESET" })} className="btn-primary">
          Bikin Baru
        </button>
      </div>
    </div>
  );
}

function FeedbackButton({
  icon,
  iconLabel,
  title,
  desc,
  fix,
  disabled,
  onClick,
}: {
  feedback: FeedbackType;
  icon: string;
  iconLabel: string;
  title: string;
  desc: string;
  fix: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="card card-hover p-6 sm:p-8 text-center no-tap-highlight disabled:opacity-50"
    >
      <div className="text-5xl mb-3" role="img" aria-label={iconLabel}>{icon}</div>
      <div className="text-xl font-extrabold text-deep-brown mb-1">{title}</div>
      <div className="text-sm text-muted font-medium">{desc}</div>
      <div className="mt-3 text-xs text-deep-brown/50">Perbaikan: {fix}</div>
    </button>
  );
}
