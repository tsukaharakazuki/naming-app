interface InputSectionProps {
  surnameA: string;
  surnameB: string;
  reading: string;
  nameLength: number;
  onSurnameAChange: (v: string) => void;
  onSurnameBChange: (v: string) => void;
  onReadingChange: (v: string) => void;
  onNameLengthChange: (v: number) => void;
  onSubmit: () => void;
  surnameAError: string;
  surnameBError: string;
  readingError: string;
}

export default function InputSection({
  surnameA, surnameB, reading, nameLength,
  onSurnameAChange, onSurnameBChange, onReadingChange, onNameLengthChange,
  onSubmit, surnameAError, surnameBError, readingError,
}: InputSectionProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
          />
          {surnameBError && <p className="text-red-500 text-xs mt-1">{surnameBError}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">名前のよみ（ひらがな）</label>
        <input
          type="text"
          value={reading}
          onChange={e => onReadingChange(e.target.value)}
          placeholder="例：みさき"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
        />
        {readingError && <p className="text-red-500 text-xs mt-1">{readingError}</p>}
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
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {n}文字
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        診断する
      </button>
    </form>
  );
}
