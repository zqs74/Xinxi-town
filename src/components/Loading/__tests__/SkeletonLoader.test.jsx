import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import SkeletonLoader, { SkeletonText, SkeletonCard, SkeletonButton, SkeletonList, SkeletonGrid, SkeletonProfile, SkeletonCircle } from '../SkeletonLoader';

describe('SkeletonLoader Components', () => {
  afterEach(() => {
    cleanup();
  });

  describe('SkeletonLoader', () => {
    it('should render with default props', () => {
      render(<SkeletonLoader />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render with custom width and height', () => {
      render(<SkeletonLoader width="50%" height={40} />);
      const skeletons = screen.getAllByRole('generic');
      const skeleton = skeletons[skeletons.length - 1];
      expect(skeleton).toHaveStyle({ width: '50%', height: '40px' });
    });

    it('should render with custom borderRadius', () => {
      render(<SkeletonLoader borderRadius={10} />);
      const skeletons = screen.getAllByRole('generic');
      const skeleton = skeletons[skeletons.length - 1];
      expect(skeleton).toHaveStyle({ borderRadius: '10px' });
    });

    it('should render with custom className', () => {
      render(<SkeletonLoader className="custom-class" />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render with custom style', () => {
      render(<SkeletonLoader style={{ margin: '10px' }} />);
      const skeletons = screen.getAllByRole('generic');
      const skeleton = skeletons[skeletons.length - 1];
      expect(skeleton).toHaveStyle({ margin: '10px' });
    });
  });

  describe('SkeletonText', () => {
    it('should render with default lines', () => {
      render(<SkeletonText />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBe(5);
    });

    it('should render with custom lines', () => {
      render(<SkeletonText lines={5} />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBe(7);
    });

    it('should render with custom lineHeight', () => {
      render(<SkeletonText lineHeight={20} />);
      const skeletons = screen.getAllByRole('generic');
      const textSkeletons = skeletons.filter(s => {
        const style = s.getAttribute('style');
        return style && style.includes('height: 20px');
      });
      expect(textSkeletons.length).toBeGreaterThan(0);
    });

    it('should render with custom gap', () => {
      render(<SkeletonText gap={12} />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render with custom lastLineWidth', () => {
      render(<SkeletonText lastLineWidth="80%" />);
      const skeletons = screen.getAllByRole('generic');
      const lastSkeleton = skeletons[skeletons.length - 1];
      expect(lastSkeleton).toHaveStyle({ width: '80%' });
    });

    it('should render with custom className', () => {
      render(<SkeletonText className="custom-class" />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('SkeletonCard', () => {
    it('should render with all sections visible', () => {
      render(<SkeletonCard />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render without avatar', () => {
      render(<SkeletonCard showAvatar={false} />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render without title', () => {
      render(<SkeletonCard showTitle={false} />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render without description', () => {
      render(<SkeletonCard showDescription={false} />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render with image', () => {
      render(<SkeletonCard showImage />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render with custom className', () => {
      render(<SkeletonCard className="custom-class" />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('SkeletonButton', () => {
    it('should render with default size', () => {
      render(<SkeletonButton />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render with custom width and height', () => {
      render(<SkeletonButton width={200} height={50} />);
      const skeletons = screen.getAllByRole('generic');
      const skeleton = skeletons.find(s => {
        const style = s.getAttribute('style');
        return style && style.includes('width: 200px');
      });
      expect(skeleton).toHaveStyle({ width: '200px', height: '50px' });
    });

    it('should render with custom className', () => {
      render(<SkeletonButton className="custom-class" />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('SkeletonList', () => {
    it('should render with default items', () => {
      render(<SkeletonList />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render with custom items', () => {
      render(<SkeletonList items={3} />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render without avatar', () => {
      render(<SkeletonList showAvatar={false} />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render without content', () => {
      render(<SkeletonList showContent={false} />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render with custom className', () => {
      render(<SkeletonList className="custom-class" />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('SkeletonGrid', () => {
    it('should render with default items and columns', () => {
      render(<SkeletonGrid />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render with custom items and columns', () => {
      render(<SkeletonGrid items={6} columns={3} />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render with custom className', () => {
      render(<SkeletonGrid className="custom-class" />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('SkeletonProfile', () => {
    it('should render profile skeleton', () => {
      render(<SkeletonProfile />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('SkeletonCircle', () => {
    it('should render with default size', () => {
      render(<SkeletonCircle />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render with custom size', () => {
      render(<SkeletonCircle size={60} />);
      const skeletons = screen.getAllByRole('generic');
      const circle = skeletons.find(s => {
        const style = s.getAttribute('style');
        return style && style.includes('width: 60px');
      });
      expect(circle).toHaveStyle({ width: '60px', height: '60px' });
    });

    it('should render with custom className', () => {
      render(<SkeletonCircle className="custom-class" />);
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});
