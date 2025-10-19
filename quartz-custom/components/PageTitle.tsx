import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../../quartz/components/types";
import { classNames } from "../../quartz/util/lang";

const PageTitle: QuartzComponentConstructor = () => {
  const PageTitle: QuartzComponent = ({
    fileData,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    const title = cfg.pageTitle;
    const isHomepage = fileData.slug === "index";

    return (
      <header className={classNames(displayClass, "page-header")}>
        {isHomepage ? (
          <h1 className="title">
            <a href="/">{title}</a>
          </h1>
        ) : (
          <h3 className="title">
            <a href="/">{title}</a>
          </h3>
        )}
      </header>
    );
  };

  PageTitle.css = `
.page-header {
  margin-top: 0;
}

/* Homepage has margin-bottom, blog posts don't */
.page-header {
  margin-bottom: 0;
}

body[data-slug="index"] .page-header {
  margin-bottom: 2rem !important;
}

.page-header .title {
  margin-top: 0;
  margin-bottom: 0;
  font-size: 3.4125rem;
  line-height: 1.1;
  font-weight: 700;
}

.page-header h3.title {
  font-size: 1.5rem;
  font-weight: 600;
}

.page-header .title a {
  box-shadow: none;
  text-decoration: none;
  color: var(--textTitle);
}

@media (max-width: 475px) {
  .page-header .title {
    font-size: 2.5rem;
  }
}
`;

  return PageTitle;
};

export default PageTitle;
