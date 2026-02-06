"use client";

export function AnnouncementBar() {
  const Item = () => (
    <p className="flex-shrink-0 flex items-center px-8 whitespace-nowrap font-body text-sm text-black text-center tracking-wider h-full">
      GẤP GÁP ĐẶT BÁNH GỌI 📞 <a href="tel:0912550335" className="hover:underline mx-1">091 255 03 35</a> - TRAO BÁNH TẬN TAY, TẠI BẮC NINH
    </p>
  );
  
  return (
    <div className="h-10 bg-white text-black border-y border-black overflow-hidden">
      <div className="flex w-max animate-marquee-fast h-full">
        <Item />
        <Item />
        <Item />
        <Item />
      </div>
    </div>
  );
}
