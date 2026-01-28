import PreHeader from "@/components/pre-header";
import Navbar from "@/components/Navbar";
import Banner from "@/components/banner";
import CategoryCard from "@/components/category-card";
import TopStylesSection from "@/components/top-styles-section";
import Marquee from "react-fast-marquee";
import FeaturedBanner from "@/components/featured-banner";
import ImageCaraousel from "@/components/image-caraousel";
import ProductCard from "@/components/product-card";
import ShopWithConfidence from "@/components/shop-with-confidence";
import Footer from "@/components/footer";

const CATEGORIES = [
  {
    label: "Earrings",
    image: "https://palmonas.com/cdn/shop/files/Earring_2a1896c7-47a1-4ea7-b4d0-14e87b202414.jpg?v=1769329612&width=400",
    hoverImage: "https://images.unsplash.com/photo-1596944920636-eb8c9d340626?w=600",
  },
  {
    label: "Necklaces",
    image: "https://palmonas.com/cdn/shop/files/neck.jpg?v=1769329612&width=400",
    hoverImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600",
  },
  {
    label: "Bracelets",
    image: "https://palmonas.com/cdn/shop/articles/6_c277cb7d-3677-4f25-bc9f-9177e8a14f75.jpg?v=1769578341&width=400",
    hoverImage: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600",
  },
  {
    label: "Mangalsutras",
    image: "https://palmonas.com/cdn/shop/files/Mamgalsutras.jpg?v=1769329611&width=200",
    hoverImage: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600",
  },
  {
    label: "Mens",
    image: "https://palmonas.com/cdn/shop/products/1_182adae1-9887-4e14-9203-abf43125dfd4.jpg?v=1744527319",
    hoverImage: "https://palmonas.com/cdn/shop/files/22_9843e52f-ad2c-44c1-8699-ec1f93f909a5.jpg?v=1744524795",
  },
  {
    label: "Rings",
    image: "https://palmonas.com/cdn/shop/files/Rings_1_30735f1c-61f6-4e90-bb25-4c6fc50e8c4e.jpg?v=1769329611&width=400",
    hoverImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600",
  },
] as const;

const SAMPLE_PRODUCTS = [
  {
    image: "https://palmonas.com/cdn/shop/files/PM-EARRINGS-037_1_0040.jpg?v=1744528665",
    title: "Textured Gold Hoop Earrings",
    currentPrice: "₹2,499",
    originalPrice: "₹3,499",
    discountLabel: "29% OFF",
    offerTag: "Best Seller",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/PMWSTMR004-G-5_0040.jpg?v=1744515204",
    title: "Minimal Gold Stacked Ring",
    currentPrice: "₹1,899",
    originalPrice: "₹2,499",
    discountLabel: "24% OFF",
    offerTag: "New Arrival",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/PMWSTMR010-G-5_0040.jpg?v=1749556121",
    title: "Classic Gold Band Ring",
    currentPrice: "₹2,199",
    originalPrice: "₹2,999",
    discountLabel: "27% OFF",
    offerTag: "Limited Offer",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/PMWSTMR001-G-5.jpg?v=1744515205",
    title: "Chunky Statement Ring",
    currentPrice: "₹2,799",
    originalPrice: "₹3,699",
    discountLabel: "24% OFF",
    offerTag: "Trending",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/NK-40_1_0040.jpg?v=1744524127",
    title: "Layered Gold Necklace",
    currentPrice: "₹3,499",
    originalPrice: "₹4,499",
    discountLabel: "22% OFF",
    offerTag: "Bestseller",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/ER159_2_0040.jpg?v=1744526452",
    title: "Crystal Drop Earrings",
    currentPrice: "₹2,299",
    originalPrice: "₹3,099",
    discountLabel: "26% OFF",
    offerTag: "Online Only",
  },
  {
    image: "https://palmonas.com/cdn/shop/files/ER253_1_0040.jpg?v=1750244118",
    title: "Everyday Gold Studs",
    currentPrice: "₹1,499",
    originalPrice: "₹1,999",
    discountLabel: "25% OFF",
    offerTag: "Editor’s Pick",
  },
  {
    image:
      "https://palmonas.com/cdn/shop/files/Artboard14_2_5d4bfe2c-a7cd-4844-be10-2cb37cd8de6c.webp?v=1768896706",
    title: "Textured Gold Chain Bracelet",
    currentPrice: "₹2,599",
    originalPrice: "₹3,299",
    discountLabel: "21% OFF",
    offerTag: "Just In",
  },
] as const;

export default function Home() {
  return (
    <div>
      <PreHeader />
      <Navbar />
      <Banner />
      <div className="bg-black/90 w-full h-[40px] flex flex-row">
        <Marquee speed={100}>
          <div className="text-white text-lg px-10">Free shipping on orders over Rs 15,000</div>
          <div className="text-white text-lg px-10">Free shipping on orders over Rs 15,000</div>
          <div className="text-white text-lg px-10">Free shipping on orders over Rs 15,000</div>
          <div className="text-white text-lg px-10">Free shipping on orders over Rs 15,000</div>
          <div className="text-white text-lg px-10">Free shipping on orders over Rs 15,000</div>

        </Marquee>
      </div>
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-4xl font-bold text-center mb-10 mt-10">Shop by category</h2>
      </div>
      <section
        className="w-full flex flex-nowrap overflow-x-auto sm:overflow-visible"
        aria-label="Shop by category"
      >
        {CATEGORIES.map((cat) => (
          <div
            key={cat.label}
            className="w-[50vw] shrink-0 sm:w-auto sm:flex-1 sm:min-w-0 px-1"
          >
            <CategoryCard
              image={cat.image}
              hoverImage={cat.hoverImage}
              label={cat.label}
              href="#"
            />
          </div>
        ))}
      </section>
      <section>
        <div className="container mx-auto px-4 py-10">
          <h2 className="text-4xl font-bold text-center mt-10 mb-4">
            Zivara Top Styles
          </h2>
        </div>
      </section>
      <TopStylesSection />
      <FeaturedBanner heading="Glamorous Collection" imageUrl="https://palmonas.com/cdn/shop/files/Home_Page_V4_4.jpg?v=1769580834&width=3840" />
      <ImageCaraousel />
      <FeaturedBanner heading="22KT Special Collection" imageUrl="https://palmonas.com/cdn/shop/files/9KT_flower_Web.png?v=1768650078&width=2000" />
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-10">Featured Products</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {SAMPLE_PRODUCTS.map((product) => (
            <ProductCard
              key={product.title}
              image={product.image}
              title={product.title}
              currentPrice={product.currentPrice}
              originalPrice={product.originalPrice}
              discountLabel={product.discountLabel}
              offerTag={product.offerTag}
            />
          ))}
        </div>
      </section>
      <section>
        <div className="relative w-full h-[520px] sm:h-[600px] md:h-[680px] lg:h-[720px]">
          <video
            className="w-full h-full object-cover"
            src="https://www.pexels.com/download/video/9328454/"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      </section>
      <ShopWithConfidence />
      <Footer />
    </div>
  );
}