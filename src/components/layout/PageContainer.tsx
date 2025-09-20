import { PropsWithChildren } from 'react';
import styles from './PageContainer.module.css';

type PageContainerProps = PropsWithChildren<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
}>;

export const PageContainer = ({ title, description, actions, children }: PageContainerProps) => {
  return (
    <section className={styles.container} aria-labelledby="page-heading">
      <header className={styles.header}>
        <div>
          <h1 id="page-heading" className={styles.title}>
            {title}
          </h1>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </header>
      <div className={styles.content}>{children}</div>
    </section>
  );
};
