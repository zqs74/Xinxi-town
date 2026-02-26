import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedbackIndicator, { RippleButton, PulseBadge, AnimatedCheckmark, ShimmerLoader, SkeletonCard } from '../FeedbackIndicator';

vi.mock('../../hooks/useUXSystem', () => ({
  useUXSystem: () => ({
    triggerSuccess: vi.fn(),
    triggerError: vi.fn(),
    triggerHaptic: vi.fn(),
    hapticEnabled: true,
  }),
}));

describe('FeedbackIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render success indicator', () => {
    render(<FeedbackIndicator type="success" message="操作成功" />);
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('操作成功')).toBeInTheDocument();
  });

  it('should render error indicator', () => {
    render(<FeedbackIndicator type="error" message="操作失败" />);
    expect(screen.getByText('✕')).toBeInTheDocument();
    expect(screen.getByText('操作失败')).toBeInTheDocument();
  });

  it('should render warning indicator', () => {
    render(<FeedbackIndicator type="warning" message="警告信息" />);
    expect(screen.getByText('⚠')).toBeInTheDocument();
    expect(screen.getByText('警告信息')).toBeInTheDocument();
  });

  it('should render info indicator', () => {
    render(<FeedbackIndicator type="info" message="提示信息" />);
    expect(screen.getByText('ℹ')).toBeInTheDocument();
    expect(screen.getByText('提示信息')).toBeInTheDocument();
  });

  it('should render loading indicator', () => {
    render(<FeedbackIndicator type="loading" message="加载中..." />);
    expect(screen.getByText('⟳')).toBeInTheDocument();
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('should not render when show is false', () => {
    render(<FeedbackIndicator type="success" message="测试" show={false} />);
    expect(screen.queryByText('✓')).not.toBeInTheDocument();
  });

  it('should auto-close after duration', async () => {
    render(<FeedbackIndicator type="success" message="自动关闭" duration={100} />);
    expect(screen.getByText('✓')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('✓')).not.toBeInTheDocument();
    }, { timeout: 500 });
  });
});

describe('RippleButton', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render with default props', () => {
    render(<RippleButton>点击按钮</RippleButton>);
    expect(screen.getByText('点击按钮')).toBeInTheDocument();
  });

  it('should render with different colors', () => {
    const { rerender } = render(<RippleButton color="purple">紫色</RippleButton>);
    expect(screen.getByText('紫色')).toBeInTheDocument();

    rerender(<RippleButton color="blue">蓝色</RippleButton>);
    expect(screen.getByText('蓝色')).toBeInTheDocument();

    rerender(<RippleButton color="green">绿色</RippleButton>);
    expect(screen.getByText('绿色')).toBeInTheDocument();

    rerender(<RippleButton color="pink">粉色</RippleButton>);
    expect(screen.getByText('粉色')).toBeInTheDocument();
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<RippleButton size="sm">小</RippleButton>);
    expect(screen.getByText('小')).toBeInTheDocument();

    rerender(<RippleButton size="md">中</RippleButton>);
    expect(screen.getByText('中')).toBeInTheDocument();

    rerender(<RippleButton size="lg">大</RippleButton>);
    expect(screen.getByText('大')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<RippleButton disabled>禁用</RippleButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ opacity: '0.6' });
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<RippleButton onClick={handleClick}>点击</RippleButton>);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    render(<RippleButton disabled onClick={handleClick}>点击</RippleButton>);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('PulseBadge', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render with default props', () => {
    render(<PulseBadge>徽章</PulseBadge>);
    expect(screen.getByText('徽章')).toBeInTheDocument();
  });

  it('should render with different colors', () => {
    const { rerender } = render(<PulseBadge color="purple">紫色</PulseBadge>);
    expect(screen.getByText('紫色')).toBeInTheDocument();

    rerender(<PulseBadge color="blue">蓝色</PulseBadge>);
    expect(screen.getByText('蓝色')).toBeInTheDocument();

    rerender(<PulseBadge color="green">绿色</PulseBadge>);
    expect(screen.getByText('绿色')).toBeInTheDocument();

    rerender(<PulseBadge color="pink">粉色</PulseBadge>);
    expect(screen.getByText('粉色')).toBeInTheDocument();
  });

  it('should not pulse when pulse is false', () => {
    render(<PulseBadge pulse={false}>不闪烁</PulseBadge>);
    expect(screen.getByText('不闪烁')).toBeInTheDocument();
  });
});

describe('AnimatedCheckmark', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render with default size', () => {
    render(<AnimatedCheckmark />);
    const svg = screen.getByRole('generic').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
  });

  it('should render with custom size', () => {
    render(<AnimatedCheckmark size={64} />);
    const svg = screen.getByRole('generic').querySelector('svg');
    expect(svg).toHaveAttribute('width', '64');
    expect(svg).toHaveAttribute('height', '64');
  });

  it('should render with custom color', () => {
    render(<AnimatedCheckmark color="#ff0000" />);
    const svg = screen.getByRole('generic').querySelector('svg');
    const circle = svg.querySelector('circle');
    expect(circle).toHaveAttribute('stroke', '#ff0000');
  });
});

describe('ShimmerLoader', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render with default props', () => {
    render(<ShimmerLoader />);
    const loaders = screen.getAllByRole('generic');
    expect(loaders.length).toBeGreaterThan(0);
  });

  it('should render with custom width and height', () => {
    render(<ShimmerLoader width="50%" height={40} />);
    const loaders = screen.getAllByRole('generic');
    const loader = loaders[loaders.length - 1];
    expect(loader).toHaveStyle({ width: '50%', height: '40px' });
  });

  it('should render with custom borderRadius', () => {
    render(<ShimmerLoader borderRadius={10} />);
    const loaders = screen.getAllByRole('generic');
    const loader = loaders[loaders.length - 1];
    expect(loader).toHaveStyle({ borderRadius: '10px' });
  });
});

describe('SkeletonCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render skeleton card', () => {
    render(<SkeletonCard />);
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
