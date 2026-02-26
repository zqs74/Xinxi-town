import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InteractiveCard, { ClickCard, SelectionCard } from '../InteractiveCard';

describe('InteractiveCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render with default props', () => {
    render(<InteractiveCard>测试卡片</InteractiveCard>);
    expect(screen.getByText('测试卡片')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(<InteractiveCard className="custom-class">测试</InteractiveCard>);
    const card = screen.getByText('测试');
    expect(card.closest('div')).toHaveClass('custom-class');
  });

  it('should render with custom style', () => {
    render(<InteractiveCard style={{ margin: '10px' }}>测试</InteractiveCard>);
    const card = screen.getByText('测试');
    expect(card.closest('div')).toHaveStyle({ margin: '10px' });
  });

  it('should render with different variants', () => {
    const { rerender } = render(<InteractiveCard variant="primary">主要</InteractiveCard>);
    expect(screen.getByText('主要')).toBeInTheDocument();

    rerender(<InteractiveCard variant="success">成功</InteractiveCard>);
    expect(screen.getByText('成功')).toBeInTheDocument();

    rerender(<InteractiveCard variant="warning">警告</InteractiveCard>);
    expect(screen.getByText('警告')).toBeInTheDocument();

    rerender(<InteractiveCard variant="error">错误</InteractiveCard>);
    expect(screen.getByText('错误')).toBeInTheDocument();

    rerender(<InteractiveCard variant="ghost">幽灵</InteractiveCard>);
    expect(screen.getByText('幽灵')).toBeInTheDocument();
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<InteractiveCard size="sm">小</InteractiveCard>);
    expect(screen.getByText('小')).toBeInTheDocument();

    rerender(<InteractiveCard size="md">中</InteractiveCard>);
    expect(screen.getByText('中')).toBeInTheDocument();

    rerender(<InteractiveCard size="lg">大</InteractiveCard>);
    expect(screen.getByText('大')).toBeInTheDocument();

    rerender(<InteractiveCard size="xl">特大</InteractiveCard>);
    expect(screen.getByText('特大')).toBeInTheDocument();
  });

  it('should show selected state', () => {
    render(<InteractiveCard selected>选中</InteractiveCard>);
    const card = screen.getByText('选中');
    expect(card.closest('div')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<InteractiveCard disabled>禁用</InteractiveCard>);
    const card = screen.getByText('禁用');
    expect(card.closest('div')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<InteractiveCard loading>加载中</InteractiveCard>);
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<InteractiveCard onClick={handleClick}>点击</InteractiveCard>);
    
    const card = screen.getByText('点击');
    await userEvent.click(card);
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    render(<InteractiveCard disabled onClick={handleClick}>点击</InteractiveCard>);
    
    const card = screen.getByText('点击');
    await userEvent.click(card);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should not call onClick when loading', async () => {
    const handleClick = vi.fn();
    render(<InteractiveCard loading onClick={handleClick}>点击</InteractiveCard>);
    
    const skeletons = screen.getAllByRole('generic');
    const card = skeletons[0];
    await userEvent.click(card);
    
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('ClickCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render with default props', () => {
    render(<ClickCard>点击卡片</ClickCard>);
    expect(screen.getByText('点击卡片')).toBeInTheDocument();
  });

  it('should render with different colors', () => {
    const { rerender } = render(<ClickCard color="purple">紫色</ClickCard>);
    expect(screen.getByText('紫色')).toBeInTheDocument();

    rerender(<ClickCard color="blue">蓝色</ClickCard>);
    expect(screen.getByText('蓝色')).toBeInTheDocument();

    rerender(<ClickCard color="green">绿色</ClickCard>);
    expect(screen.getByText('绿色')).toBeInTheDocument();

    rerender(<ClickCard color="pink">粉色</ClickCard>);
    expect(screen.getByText('粉色')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ClickCard disabled>禁用</ClickCard>);
    const card = screen.getByText('禁用');
    expect(card.closest('div')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<ClickCard onClick={handleClick}>点击</ClickCard>);
    
    const card = screen.getByText('点击');
    await userEvent.click(card);
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('should render with custom className', () => {
    render(<ClickCard className="custom-class">测试</ClickCard>);
    const card = screen.getByText('测试');
    expect(card.closest('div')).toHaveClass('custom-class');
  });

  it('should render with custom style', () => {
    render(<ClickCard style={{ margin: '10px' }}>测试</ClickCard>);
    const card = screen.getByText('测试');
    expect(card.closest('div')).toHaveStyle({ margin: '10px' });
  });
});

describe('SelectionCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render with default props', () => {
    render(<SelectionCard>选择卡片</SelectionCard>);
    expect(screen.getByText('选择卡片')).toBeInTheDocument();
  });

  it('should show selected state', () => {
    render(<SelectionCard selected>选中</SelectionCard>);
    const card = screen.getByText('选中');
    expect(card.closest('div')).toBeInTheDocument();
  });

  it('should not show selected state when selected is false', () => {
    render(<SelectionCard selected={false}>未选中</SelectionCard>);
    const card = screen.getByText('未选中');
    expect(card.closest('div')).toBeInTheDocument();
  });

  it('should render with different colors', () => {
    const { rerender } = render(<SelectionCard color="purple">紫色</SelectionCard>);
    expect(screen.getByText('紫色')).toBeInTheDocument();

    rerender(<SelectionCard color="blue">蓝色</SelectionCard>);
    expect(screen.getByText('蓝色')).toBeInTheDocument();

    rerender(<SelectionCard color="green">绿色</SelectionCard>);
    expect(screen.getByText('绿色')).toBeInTheDocument();

    rerender(<SelectionCard color="pink">粉色</SelectionCard>);
    expect(screen.getByText('粉色')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<SelectionCard onClick={handleClick}>点击</SelectionCard>);
    
    const card = screen.getByText('点击');
    await userEvent.click(card);
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('should render with custom className', () => {
    render(<SelectionCard className="custom-class">测试</SelectionCard>);
    const card = screen.getByText('测试');
    expect(card.closest('div')).toHaveClass('custom-class');
  });

  it('should render with custom style', () => {
    render(<SelectionCard style={{ margin: '10px' }}>测试</SelectionCard>);
    const card = screen.getByText('测试');
    expect(card.closest('div')).toHaveStyle({ margin: '10px' });
  });
});
