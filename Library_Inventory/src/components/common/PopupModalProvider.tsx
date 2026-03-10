import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import styles from './PopupModalProvider.module.css';

type PopupTone = 'default' | 'success' | 'danger';

interface PopupOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: PopupTone;
}

interface AlertState extends PopupOptions {
  type: 'alert';
  message: string;
  resolve: () => void;
}

interface ConfirmState extends PopupOptions {
  type: 'confirm';
  message: string;
  resolve: (value: boolean) => void;
}

type PopupState = AlertState | ConfirmState;

interface PopupModalContextValue {
  showAlert: (message: string, options?: PopupOptions) => Promise<void>;
  showConfirm: (message: string, options?: PopupOptions) => Promise<boolean>;
}

const PopupModalContext = createContext<PopupModalContextValue | null>(null);

export function PopupModalProvider({ children }: PropsWithChildren) {
  const [popupState, setPopupState] = useState<PopupState | null>(null);

  const showAlert: PopupModalContextValue['showAlert'] = (message, options = {}) =>
    new Promise<void>((resolve) => {
      setPopupState({
        type: 'alert',
        message,
        resolve,
        ...options,
      });
    });

  const showConfirm: PopupModalContextValue['showConfirm'] = (message, options = {}) =>
    new Promise<boolean>((resolve) => {
      setPopupState({
        type: 'confirm',
        message,
        resolve,
        ...options,
      });
    });

  useEffect(() => {
    if (!popupState) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (popupState.type === 'confirm') {
        popupState.resolve(false);
      } else {
        popupState.resolve();
      }
      setPopupState(null);
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [popupState]);

  const contextValue = useMemo(
    () => ({
      showAlert,
      showConfirm,
    }),
    []
  );

  const closeAlert = () => {
    if (!popupState || popupState.type !== 'alert') {
      return;
    }

    popupState.resolve();
    setPopupState(null);
  };

  const closeConfirm = (result: boolean) => {
    if (!popupState || popupState.type !== 'confirm') {
      return;
    }

    popupState.resolve(result);
    setPopupState(null);
  };

  const toneClassName =
    popupState?.tone === 'danger'
      ? styles.danger
      : popupState?.tone === 'success'
        ? styles.success
        : '';

  return (
    <PopupModalContext.Provider value={contextValue}>
      {children}

      {popupState && (
        <div
          className={styles.backdrop}
          onClick={() => {
            if (popupState.type === 'confirm') {
              closeConfirm(false);
              return;
            }
            closeAlert();
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label={popupState.title || 'Popup message'}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className={`${styles.title} ${toneClassName}`}>
              {popupState.title || (popupState.type === 'confirm' ? 'Please Confirm' : 'Notice')}
            </h3>

            <p className={styles.message}>{popupState.message}</p>

            <div className={styles.actions}>
              {popupState.type === 'confirm' ? (
                <>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => closeConfirm(false)}
                  >
                    {popupState.cancelText || 'Cancel'}
                  </button>
                  <button
                    type="button"
                    className={`${styles.primaryButton} ${toneClassName}`}
                    onClick={() => closeConfirm(true)}
                  >
                    {popupState.confirmText || 'Confirm'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={`${styles.primaryButton} ${toneClassName}`}
                  onClick={closeAlert}
                >
                  {popupState.confirmText || 'OK'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </PopupModalContext.Provider>
  );
}

export function usePopupModal() {
  const context = useContext(PopupModalContext);

  if (!context) {
    throw new Error('usePopupModal must be used within a PopupModalProvider');
  }

  return context;
}
