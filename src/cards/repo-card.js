// @ts-check
import { Card } from "../common/Card.js";
import { createProgressNode } from "../common/createProgressNode.js"; // Correct import path
import { I18n } from "../common/I18n.js";
import { icons } from "../common/icons.js"; // Import icons here
import {
  encodeHTML,
  flexLayout,
  getCardColors,
  kFormatter,
  measureText,
  parseEmojis,
  wrapTextMultiline,
  iconWithLabel,
  createLanguageNode,
  clampValue,
} from "../common/utils.js";
import { repoCardLocales } from "../translations.js";

const ICON_SIZE = 16;
const DESCRIPTION_LINE_WIDTH = 59;
const DESCRIPTION_MAX_LINES = 3;

const getBadgeSVG = (label, textColor) => `
  <g data-testid="badge" class="badge" transform="translate(320, -18)">
    <rect stroke="${textColor}" stroke-width="1" width="70" height="20" x="-12" y="-14" ry="10" rx="10"></rect>
    <text
      x="23" y="-5"
      alignment-baseline="central"
      dominant-baseline="central"
      text-anchor="middle"
      fill="${textColor}"
    >
      ${label}
    </text>
  </g>
`;

const renderRepoCard = (repo, options = {}) => {
  const {
    name,
    nameWithOwner,
    description,
    primaryLanguage,
    isArchived,
    isTemplate,
    starCount,
    forkCount,
  } = repo;

  const {
    hide_border = false,
    title_color = "#000", // Default title color
    icon_color = "#000", // Default icon color
    text_color = "#000", // Default text color
    bg_color = "#fff", // Default background color
    show_owner = false,
    theme = "default_repocard",
    border_radius,
    border_color,
    locale,
    description_lines_count,
  } = options;

  const lineHeight = 10;
  const header = show_owner ? nameWithOwner : name;

  const langName = (primaryLanguage && primaryLanguage.name) || "Unspecified";
  const langColor = (primaryLanguage && primaryLanguage.color) || "#333";

  const descriptionMaxLines = description_lines_count
    ? clampValue(description_lines_count, 1, DESCRIPTION_MAX_LINES)
    : DESCRIPTION_MAX_LINES;

  const desc = parseEmojis(description || "No description provided");
  
  const multiLineDescription = wrapTextMultiline(
    desc,
    DESCRIPTION_LINE_WIDTH,
    descriptionMaxLines
  );

  const descriptionSvg = multiLineDescription
    .map((line) => `<tspan dy="1.2em" x="25">${encodeHTML(line)}</tspan>`)
    .join("");

  // Adjust height calculation to ensure all elements fit
  const height =
    (descriptionMaxLines > 1 ? 120 : 110) + descriptionMaxLines * lineHeight + 50; // Added extra space

  const i18n = new I18n({
    locale,
    translations: repoCardLocales,
  });

  const colors = getCardColors({
    title_color,
    icon_color,
    text_color,
    bg_color,
    border_color,
    theme
  });

  const totalStars = kFormatter(starCount);
  const totalForks = kFormatter(forkCount);
  
  const svgStars = iconWithLabel(
    icons.star, 
    totalStars, 
    "stargazers", 
    ICON_SIZE
  );
  
  const svgForks = iconWithLabel(
    icons.fork, 
    totalForks, 
    "forkcount", 
    ICON_SIZE
  );

  const starAndForkCount = flexLayout({
      items: [svgStars, svgForks],
      sizes: [
        ICON_SIZE + measureText(`${totalStars}`, 12),
        ICON_SIZE + measureText(`${totalForks}`, 12),
      ],
      gap: 25
   }).join("");

   const card = new Card({
     defaultTitle: header.length > 35 ? `${header.slice(0,35)}...` : header,
     titlePrefixIcon: icons.contribs, // Use appropriate icon for contributors
     width: 400,
     height: height, // Ensure height includes space for all elements
     border_radius: border_radius || undefined, // Ensure border radius is set correctly
     colors
   });

   // Add animations for the stars and forks count
   const starAnimationDelay = (index) => (index + 1) * 150; // Example staggered delay

   return card.render(`
     <g>
       ${
         isTemplate
           ? getBadgeSVG(i18n.t("repocard.template"), colors.textColor)
           : isArchived
             ? getBadgeSVG(i18n.t("repocard.archived"), colors.textColor)
             : ""
       }
       <text class="description" x="25" y="-5" fill="${colors.textColor}">
         ${descriptionSvg}
       </text>
       <g transform="translate(30, ${height -75})">
         ${svgStars.replace('stargazers', `stargazers" style="animation-delay:${starAnimationDelay(0)}ms; fill:${colors.iconColor};`)}
         ${svgForks.replace('forkcount', `forkcount" style="animation-delay:${starAnimationDelay(1)}ms; fill:${colors.iconColor};`)}
       </g>
     </g>
   `);
};

export { renderRepoCard };
export default renderRepoCard;
