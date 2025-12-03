document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById('toggle-sidebar');
  if (!button) return;
  
  button.addEventListener('click', () => {
    console.log("CALLED");
    const sidebar = document.getElementById('sidebar');
    const iconOpen = document.getElementById('icon-open');
    const iconClose = document.getElementById('icon-close');
    sidebar?.classList.toggle("w-[5rem]");
    iconOpen?.classList.toggle("hidden");
    iconClose?.classList.toggle("hidden");
  });
});