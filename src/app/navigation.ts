type MenuState = "mobile" | "language" | null;

const menuState: { activeMenu: MenuState } = { activeMenu: null };

const getMobileMenu = () => document.getElementById("mobile-navigation");
const getMobileMenuButton = () => document.getElementById("mobile-menu-button");
const getMobileMenuContent = () =>
  document.getElementById("mobile-navigation-content");
const getLanguageSection = () =>
  document.getElementById("language-currency-selector-options");
const getLanguageContent = () =>
  document.getElementById("language-currency-selector-options-content");
const getLanguageButton = () =>
  document.getElementById("language-currency-selector-button");
const getLanguageButtonMobile = () =>
  document.getElementById("language-currency-selector-button-mobile");
const getLanguageClose = () =>
  document.getElementById("language-selector-closed-button");

document.addEventListener("DOMContentLoaded", () => {
  const initializeMenu = () => {
    const disableScroll = () => {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    };

    const activateScroll = () => {
      document.body.style.overflow = "auto";
      document.body.style.position = "static";
      document.body.style.width = "auto";
    };

    // Menü durumlarını kontrol eden fonksiyonlar
    const openMenu = (menu: MenuState) => {
      if (menuState.activeMenu && menuState.activeMenu !== menu) {
        closeMenu(); // Başka bir menü açıksa kapat
      }
      menuState.activeMenu = menu;
      if (menu === "mobile") {
        getMobileMenu()?.setAttribute("data-state", "open");
      } else if (menu === "language") {
        getLanguageSection()?.setAttribute("data-state", "open");
      }

      disableScroll();
    };

    const closeMenu = () => {
      if (menuState.activeMenu === "mobile") {
        getMobileMenu()?.setAttribute("data-state", "closed");
      } else if (menuState.activeMenu === "language") {
        getLanguageSection()?.setAttribute("data-state", "closed");
      }

      activateScroll();
      menuState.activeMenu = null;
    };

    // Outside click kontrolü
    document.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as Node;

      if (menuState.activeMenu === "mobile") {
        const mobileMenuContent = getMobileMenuContent();
        const mobileMenuButton = getMobileMenuButton();
        if (
          mobileMenuContent &&
          mobileMenuButton &&
          !mobileMenuContent.contains(target) &&
          !mobileMenuButton.contains(target)
        ) {
          closeMenu();
        }
      } else if (menuState.activeMenu === "language") {
        const languageContent = getLanguageContent();
        if (languageContent && !languageContent.contains(target)) {
          closeMenu();
        }
      }
    });

    // Escape tuşu kontrolü
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    });

    // Mobil menü
    const mobileMenuButton = getMobileMenuButton();
    mobileMenuButton?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (menuState.activeMenu === "mobile") {
        closeMenu();
      } else {
        openMenu("mobile");
      }
    });

    // Dil menüsü
    const languageButton = getLanguageButton();
    const languageButtonMobile = getLanguageButtonMobile();
    const languageClose = getLanguageClose();
    [languageButton, languageButtonMobile, languageClose].forEach((button) =>
      button?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (menuState.activeMenu === "language") {
          closeMenu();
        } else {
          openMenu("language");
        }
      }),
    );
  };

  initializeMenu();
});
