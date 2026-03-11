const ERROR_CATCHER_SCRIPT = `<script>window.onerror=function(msg,src,line,col,err){window.parent.postMessage({type:"iframe-error",message:msg+" (line "+line+")"},"*");return true;};</script>`;

export function injectErrorCatcher(code: string): string {
  const headClose = code.indexOf("</head>");
  if (headClose !== -1) {
    return (
      code.slice(0, headClose) + ERROR_CATCHER_SCRIPT + code.slice(headClose)
    );
  }
  const bodyOpen = code.indexOf("<body");
  if (bodyOpen !== -1) {
    return (
      code.slice(0, bodyOpen) + ERROR_CATCHER_SCRIPT + code.slice(bodyOpen)
    );
  }
  const htmlOpen = code.toLowerCase().indexOf("<html");
  if (htmlOpen !== -1) {
    const htmlEnd = code.indexOf(">", htmlOpen) + 1;
    return code.slice(0, htmlEnd) + ERROR_CATCHER_SCRIPT + code.slice(htmlEnd);
  }
  const doctypeEnd = code.toLowerCase().indexOf("<!doctype html>");
  if (doctypeEnd !== -1) {
    return (
      code.slice(0, doctypeEnd + 15) +
      ERROR_CATCHER_SCRIPT +
      code.slice(doctypeEnd + 15)
    );
  }
  return ERROR_CATCHER_SCRIPT + code;
}
