const ResponseCard = ({ response }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-border">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold">
          AI
        </div>
        <div className="flex-1">
          <p className="text-xs text-text-primary dark:text-white leading-relaxed">{response.answer}</p>
        </div>
      </div>
    </div>
  );
};

export default ResponseCard;