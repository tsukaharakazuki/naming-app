type InputMode = "hiragana" | "exact" | "ateji";

interface InputSectionProps {
  surnameA: string;
  surnameB: string;
  reading: string;
  kanjiInput: string;
  nameLength: number;
  inputMode: InputMode;
  desiredKanji: string;
  excludedKanji: string;
  onSurnameAChange: (v: string) => void;
  onSurnameBChange: (v: string) => void;
  onReadingChange: (v: string) => void;
  onKanjiInputChange: (v: string) => void;
  onDesiredKanjiChange: (v: string) => void;
  onExcludedKanjiChange: (v: string) => void;
  onNameLengthChange: (v: number) => void;
  onInputModeChange: (v: InputMode) => void;
  onSubmit: () => void;
  surnameAError: string;
  surnameBError: string;
  nameError: string;
}

const modeTabs: { mode: InputMode; label: string }[] = [
  { mode: "hiragana", label: "よみかた" },
  { mode: "ateji", label: "当て字" },
  { mode: "exact", label: "入力一致" },
];

export default function InputSection({
  surnameA, surnameB, reading, kanjiInput, nameLength, inputMode, desiredKanji, excludedKanji,
  onSurnameAChange, onSurnameBChange, onReadingChange, onKanjiInputChange,
  onDesiredKanjiChange, onExcludedKanjiChange, onNameLengthChange, onInputModeChange,
  onSubmit, surnameAError, surnameBError, nameError,
}: InputSectionProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const showReadingInputs = inputMode === "hiragana" || inputMode === "ateji";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-4 md:p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">夫の姓（漢字）</label>
          <input
            type="text"
            value={surnameA}
            onChange={e => onSurnameAChange(e.target.value)}
            placeholder="例：田中"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
          />
          {surnameAError && <p className="text-red-500 text-xs mt-1">{surnameAError}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">妻の姓（漢字）</label>
          <input
            type="text"
            value={surnameB}
            onChange={e => onSurnameBChange(e.target.value)}
            placeholder="例：鈴木"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
          />
          {surnameBError && <p className="text-red-500 text-xs mt-1">{surnameBError}</p>}
        </div>
      </div>

      {/* 入力モード切替タブ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">名前の入力方法</label>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          {modeTabs.map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => onInputModeChange(mode)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                inputMode === mode
                  ? "bg-orange-500 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {showReadingInputs ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名前のよみ（ひらがな）</label>
            <input
              type="text"
              value={reading}
              onChange={e => onReadingChange(e.target.value)}
              placeholder="例：みさき"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
            />
            {inputMode === "ateji" && (
              <p className="text-xs text-gray-400 mt-1">漢字の読みの先頭を当てはめて候補を生成します</p>
            )}
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">使いたい漢字（任意）</label>
            <input
              type="text"
              value={desiredKanji}
              onChange={e => onDesiredKanjiChange(e.target.value)}
              placeholder="例：美、咲"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">入力した漢字を含む候補のみ表示します</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">使いたくない漢字（任意）</label>
            <input
              type="text"
              value={excludedKanji}
              onChange={e => onExcludedKanjiChange(e.target.value)}
              placeholder="例：死、苦"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">入力した漢字を含む候補を除外します</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">名前の文字数</label>
            <div className="flex gap-2">
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onNameLengthChange(n)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    nameLength === n
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {n}文字
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
          <input
            type="text"
            value={kanjiInput}
            onChange={e => onKanjiInputChange(e.target.value)}
            placeholder="例：美咲、みさき"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">入力した名前の姓名判断を行います</p>
          {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        診断する
      </button>
    </form>
  );
}
