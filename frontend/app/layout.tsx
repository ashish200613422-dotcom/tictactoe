import "./globals.css";

export const metadata = {
  title: "Three in a Row",
  description: "Tic Tac Toe game interface.",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}