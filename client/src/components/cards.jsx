const Card = ({ title, description }) => {
  return (
    <div className="group perspective w-64 h-40 cursor-pointer p-5">
      <div className="relative w-full h-full transition-transform duration-700 transform-style-3d group-hover:rotate-y-180">
        {/* Front Side */}
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-2xl flex items-center justify-center p-6">
          <h3 className="text-3xl font-bold text-white text-center drop-shadow-lg">
            {title}
          </h3>
        </div>
        
        {/* Back Side */}
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl shadow-2xl flex items-center justify-center p-6 rotate-y-180">
          <p className="text-sm text-white text-center leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
export default Card;