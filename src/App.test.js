import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ADZAP heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/adzap/i);
  expect(headingElement).toBeInTheDocument();
});
