import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Hello } from './index';

describe('hello', () => {
  it('should pass', () => {
    render(<Hello />);
    expect(screen.getByText('World')).toBeInTheDocument();
  });
});
