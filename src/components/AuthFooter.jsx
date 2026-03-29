const AuthFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="auth-mini-footer">
      <p>© {year} Hostel Hub Kenya. All rights reserved.</p>
    </footer>
  );
};

export default AuthFooter;
