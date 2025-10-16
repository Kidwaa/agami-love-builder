import React from "react";

interface PublishAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface PageActionsValue {
  publishAction?: PublishAction;
  setPublishAction: (action?: PublishAction) => void;
}

const PageActionsContext = React.createContext<PageActionsValue | undefined>(undefined);

export function PageActionsProvider({ children }: { children: React.ReactNode }) {
  const [publishAction, setPublishAction] = React.useState<PublishAction | undefined>(undefined);
  const value = React.useMemo(() => ({ publishAction, setPublishAction }), [publishAction]);
  return <PageActionsContext.Provider value={value}>{children}</PageActionsContext.Provider>;
}

export function usePageActions() {
  const ctx = React.useContext(PageActionsContext);
  if (!ctx) throw new Error("usePageActions must be used within PageActionsProvider");
  return ctx;
}
