
const MiningGallery = () => {
  const images = [
    {
      src: '/lovable-uploads/be5c4404-6861-443b-a41a-31de9d828360.png',
      alt: 'Small-scale mining operations with processing equipment'
    },
    {
      src: '/lovable-uploads/22446d24-774b-4983-98db-3f6c81dc38dc.png',
      alt: 'Gold Trail mining equipment in operation'
    },
    {
      src: '/lovable-uploads/4c66bdfb-095a-4f12-82a9-b97ba9e00178.png',
      alt: 'Miners working at an active mining site'
    },
    {
      src: '/lovable-uploads/9479cdd5-c672-473e-b4a9-a0396d1dcb40.png',
      alt: 'Heavy mining equipment and excavators'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Empowering <span className="text-amber-600">Mining Communities</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            From small-scale operations to advanced equipment financing, we support the entire mining ecosystem with data-driven solutions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {images.map((image, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <img 
                src={image.src}
                alt={image.alt}
                className="w-full h-64 lg:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-medium">{image.alt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MiningGallery;
