'use client';;
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import * as React from 'react';

export const MultipleSelect = ({
  tags,
  customTag,
  onChange,
  defaultValue
}) => {
  const [selected, setSelected] = useState(defaultValue ?? []);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef?.current) {
      containerRef.current.scrollBy({
        left: containerRef.current?.scrollWidth,
        behavior: 'smooth',
      });
    }
    onValueChange(selected);
  }, [selected]);

  const onValueChange = (value) => {
    onChange?.(value);
  };

  const onSelect = (item) => {
    setSelected((prev) => [...prev, item]);
  };

  const onDeselect = (item) => {
    setSelected((prev) => prev.filter((i) => i !== item));
  };

  return (
    (<AnimatePresence mode={'popLayout'}>
      <div className={'flex w-full flex-col gap-2'}>
        {/* <strong>TAGS</strong> */}
        <motion.div
          layout
          ref={containerRef}
          className='selected no-scrollbar flex h-12 w-full items-center overflow-x-scroll scroll-smooth rounded-md border border-solid border-gray-200 bg-gray-50 p-2'>
          <motion.div layout className='flex items-center gap-2'>
            {selected?.map((item) => (
              <Tag name={item?.key} key={item?.key} className={'bg-white shadow'}>
                <div className='flex items-center gap-2'>
                  <motion.span layout className={'text-nowrap'}>
                    {item?.name}
                  </motion.span>
                  <button className={''} onClick={() => onDeselect(item)}>
                    <X size={14} />
                  </button>
                </div>
              </Tag>
            ))}
          </motion.div>
        </motion.div>
        {tags?.length > selected?.length && (
          <div
            className='flex w-full flex-wrap gap-2 rounded-md border border-solid border-gray-200 p-2'>
            {tags
              ?.filter((item) => !selected?.some((i) => i.key === item.key))
              .map((item) => (
                <Tag name={item?.key} onClick={() => onSelect(item)} key={item?.key}>
                  {customTag ? (
                    customTag(item)
                  ) : (
                    <motion.span layout className={'text-nowrap'}>
                      {item?.name}
                    </motion.span>
                  )}
                </Tag>
              ))}
          </div>
        )}
      </div>
    </AnimatePresence>)
  );
};

export const Tag = ({
  children,
  className,
  name,
  onClick
}) => {
  return (
    (<motion.div
      layout
      layoutId={name}
      onClick={onClick}
      className={(
        `cursor-pointer rounded-md bg-gray-200 px-2 py-1 text-sm ${className}`
      )}>
      {children}
    </motion.div>)
  );
};
