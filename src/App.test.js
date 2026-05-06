import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the home page and responsive navigation controls', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', {
      name: /a crypto-native venture firm built by founders, for founders\./i,
    })
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /open navigation/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /investors/i })).toHaveAttribute('aria-disabled', 'true');
});
