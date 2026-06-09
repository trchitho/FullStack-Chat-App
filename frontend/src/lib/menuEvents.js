export const FLOATING_MENU_CLOSE_EVENT = "pingme:close-floating-menus";

export const closeFloatingMenus = () => {
  window.dispatchEvent(new Event(FLOATING_MENU_CLOSE_EVENT));
};
