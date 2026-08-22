export const isInAppBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1) || (ua.indexOf("Instagram") > -1) || (ua.indexOf("WhatsApp") > -1) || (ua.indexOf("Line") > -1);
};
