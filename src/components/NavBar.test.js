import { render, screen } from '@testing-library/react';
import NavBar from './NavBar';

describe('NavBar', () => {
  test('renders an Investors button that is disabled with a "Coming Soon" tooltip', () => {
    render(<NavBar page="home" go={() => {}} scrolled={false} />);
    const investorsBtn = screen.getByRole('button', { name: /investors/i });
    expect(investorsBtn).toBeDisabled();
    expect(investorsBtn).toHaveAttribute('data-tooltip', 'Coming Soon');
  });

  test('does not render an Investors anchor link', () => {
    render(<NavBar page="home" go={() => {}} scrolled={false} />);
    expect(screen.queryByRole('link', { name: /investors/i })).toBeNull();
  });
});
