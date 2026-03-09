/**
 * Skeleton — animated placeholder for loading states
 * Usage: <Skeleton width="100%" height={20} />
 *        <SkeletonCard /> — pre-built post card skeleton
 *        <SkeletonGallery /> — pre-built gallery grid skeleton
 */

export default function Skeleton({ width = '100%', height = 16, style = {} }) {
  return (
    <div className="skeleton" style={{ width, height, borderRadius: 2, ...style }} />
  )
}

export function SkeletonCard() {
  return (
    <div style={{ background: 'var(--panel)', padding: '24px 24px 20px', border: '1px solid var(--border)' }}>
      <Skeleton width={60} height={10} style={{ marginBottom: 12 }} />
      <Skeleton width="85%" height={20} style={{ marginBottom: 8 }} />
      <Skeleton width="70%" height={20} style={{ marginBottom: 16 }} />
      <Skeleton height={13} style={{ marginBottom: 6 }} />
      <Skeleton height={13} style={{ marginBottom: 6 }} />
      <Skeleton width="60%" height={13} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton width={80} height={10} />
        <Skeleton width={50} height={10} />
      </div>
    </div>
  )
}

export function SkeletonGalleryItem() {
  return (
    <div style={{ breakInside: 'avoid', marginBottom: 4, aspectRatio: '4/3', overflow: 'hidden' }}>
      <div className="skeleton" style={{ width: '100%', height: '100%', minHeight: 160 }} />
    </div>
  )
}
