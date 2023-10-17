import React from 'react';
import {render} from '@testing-library/react';
import App from './App';

test('renders Team RWB heading', () => {
  const {getByText} = render(<App />);
  const splashElement = getByText(/Team RWB/i);
  expect(splashElement).toBeInTheDocument();
});
