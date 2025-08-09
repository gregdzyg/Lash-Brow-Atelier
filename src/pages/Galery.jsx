import { Link } from "react-router-dom";
const images = import.meta.glob('../assets/images/*.{jpg,jpeg,png,JPG}', {
  eager: true,
});

const galleryImages = Object.values(images)
  .map((mod) => mod.default)
  .slice(0, 16); 

const Gallery = () => {
  return (
    <section className="py-10 sm:px-4 lg:px-8">
      <h2 className="text-center text-2xl text-[var(--gold)] font-semibold mb-8">
        Galeria
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-6 w-4/5 mx-auto justify-center">
        {galleryImages.map((src, index) => (
          <div key={index} className="overflow-hidden rounded-full aspect-square shadow">
            <img
              src={src}
              alt={`Galeria ${index + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 rounded-full"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-10">
       <Link
        to="/contact"
        className="relative inline-block text-[var(--gold)] font-semibold px-6 py-3 mt-4 rounded-full 
                   bg-[var(--background)] border-2 border-[var(--gold)] hover:border-white hover:text-white">
        Umów się na wizytę
      </Link>
      </div>
    </section>
  );
};

export default Gallery;