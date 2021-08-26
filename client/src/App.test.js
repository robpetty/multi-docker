import { render, screen } from '@testing-library/react';
import App from './App';

// Commented test lines out as by class 152, express server is not running
// in prod yet, so the call to Fib will fail at moment.
test('renders learn react link', () => {
  /*
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
  */
});
