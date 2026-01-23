
"use client";

import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';

const marqueeVariants = {
  animate: {
    x: ['-50%', '0%'],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 40,
        ease: "linear",
      },
    },
  },
};

export function AnnouncementBar() {
  const announcements = [
    "TRAO BÁNH TẬN TAY, TẠI BẮC NINH",
    "GẤP GÁP ĐẶT BÁNH GỌI 091 255 03 35",
  ];
  
  const AnnouncementItems = ({ keyPrefix }: { keyPrefix: string }) => (
    <>
      {announcements.map((text, index) => (
        <div key={`${keyPrefix}-${index}`} className="flex-shrink-0 flex items-center h-10 px-8">
          <p className="font-body text-sm text-[#0A0A0A] text-center tracking-wider">
            {text.includes("091 255 03 35") ? (
              <span className="flex items-center">
                GẤP GÁP ĐẶT BÁNH GỌI <Phone className="mx-2 h-4 w-4" /><a href="tel:0912550335">091 255 03 35</a>
              </span>
            ) : text}
          </p>
        </div>
      ))}
    </>
  );

  return (
     <div className="bg-gray-100 text-foreground border-b overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap"
          variants={marqueeVariants}
          animate="animate"
        >
          <AnnouncementItems keyPrefix="first" />
          <AnnouncementItems keyPrefix="second" />
        </motion.div>
      </div>
  )
}
