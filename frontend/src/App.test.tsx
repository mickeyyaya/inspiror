import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('Inspiror App', () => {
  it('renders initial chat greeting from AI Buddy', () => {
    render(<App />);
    expect(screen.getByText(/Hi! I'm your builder buddy/i)).toBeInTheDocument();
  });

  it('allows user to type and submit a message and shows loading state', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Type your idea here/i);
    const button = screen.getByRole('button', { name: /Send/i });

    fireEvent.change(input, { target: { value: 'Make a drawing app' } });
    fireEvent.click(button);

    // Expect the user message to be added to the list
    expect(screen.getByText('Make a drawing app')).toBeInTheDocument();

    // Expect some loading indicator text/role
    expect(screen.getByText(/Building.../i)).toBeInTheDocument();
  });

  it('can toggle the floating chat visibility', () => {
    render(<App />);

    // Chat should be visible initially
    expect(screen.getByText(/Hi! I'm your builder buddy/i)).toBeInTheDocument();

    // Find the toggle button
    const toggleButton = screen.getByRole('button', { name: /Hide Chat/i });
    fireEvent.click(toggleButton);

    // Chat content should be hidden (using queryByText as it shouldn't exist or be visible)
    expect(screen.queryByText(/Hi! I'm your builder buddy/i)).not.toBeInTheDocument();

    // Find toggle to show again
    const showButton = screen.getByRole('button', { name: /Show Chat/i });
    fireEvent.click(showButton);

    // Chat should be back
    expect(screen.getByText(/Hi! I'm your builder buddy/i)).toBeInTheDocument();
  });

  it('renders the preview sandbox iframe', () => {
    render(<App />);
    const iframe = screen.getByTitle('Preview Sandbox');
    expect(iframe).toBeInTheDocument();
  });
});
