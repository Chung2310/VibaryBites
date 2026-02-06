"use client";

export function AnnouncementBar() {
  const Item = () => (
    <p className="flex-shrink-0 flex items-center px-8 whitespace-nowrap font-body text-sm text-black text-center tracking-wider h-full">
      GẤP GÁP ĐẶT BÁNH GỌI 📞 <a href="tel:0907860330" className="hover:underline mx-1">090 786 0330</a> - TRAO BÁNH TẬN TAY, TẠI HÀ NỘI
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
