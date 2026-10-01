"use client";

import Image from "next/image";
import { useRef } from "react";
import { IoClose, IoExpandOutline } from "react-icons/io5";
import styles from "./photo-zoom.module.css";

type Point = { x: number; y: number };

const distance = ([a, b]: Point[]) => Math.hypot(a.x - b.x, a.y - b.y);

export function PhotoZoom({ src, alt }: { src: string; alt: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const view = useRef({ scale: 1, x: 0, y: 0 });
  const start = useRef({ dist: 0, scale: 1, x: 0, y: 0, px: 0, py: 0 });
  const lastTap = useRef(0);
  const multiTouch = useRef(false);

  const apply = (animate = false) => {
    const { scale, x, y } = view.current;
    image.current!.style.transition = animate ? "transform 0.2s" : "none";
    image.current!.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  };

  const reset = () => {
    view.current = { scale: 1, x: 0, y: 0 };
    apply(true);
  };

  const snapshot = () => {
    const points = [...pointers.current.values()];
    start.current = {
      ...view.current,
      dist: points.length === 2 ? distance(points) : 0,
      px: points[0]?.x ?? 0,
      py: points[0]?.y ?? 0,
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch") return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size > 1) multiTouch.current = true;
    snapshot();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const points = [...pointers.current.values()];
    const s = start.current;

    if (points.length === 2) {
      view.current.scale = Math.min(5, Math.max(1, (s.scale * distance(points)) / s.dist));
    } else if (view.current.scale > 1) {
      view.current.x = s.x + points[0].x - s.px;
      view.current.y = s.y + points[0].y - s.py;
    }
    apply();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointers.current.delete(e.pointerId)) return;
    snapshot();
    if (pointers.current.size > 0) return;

    const doubleTap = !multiTouch.current && e.timeStamp - lastTap.current < 300;
    if (doubleTap || view.current.scale === 1) reset();
    lastTap.current = multiTouch.current ? 0 : e.timeStamp;
    multiTouch.current = false;
  };

  return (
    <>
      <button type="button" className={styles.thumb} onClick={() => dialog.current?.showModal()}>
        <Image src={src} alt={alt} width={130} height={130} className={styles.thumbImage} />
        <span className={styles.badge}>
          <IoExpandOutline size={14} />
        </span>
      </button>

      <dialog
        ref={dialog}
        className={styles.dialog}
        onClick={(e) => (e.nativeEvent as PointerEvent).pointerType === "mouse" && dialog.current?.close()}
        onClose={reset}
      >
        <div
          ref={image}
          className={styles.image}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <Image src={src} alt={alt} fill sizes="100vw" className={styles.full} />
        </div>
        <button type="button" className={styles.close} onClick={() => dialog.current?.close()} aria-label="Закрити">
          <IoClose size={28} />
        </button>
      </dialog>
    </>
  );
}
