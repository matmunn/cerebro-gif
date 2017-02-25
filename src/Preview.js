const React = require('react');
const styles = require('./styles.css');

module.exports = ({ urls, id, user }) => {
  const url = urls.small;
  const photographer = user.name;
  const photographerLink = user.links.html;
  return (
    <div key={id}>
      <img src={url} className={styles.preview} />
      {<div className={styles.details}>Photo by <a href={photographerLink}>{photographer}</a> / <a href="http://www.unsplash.com">Unsplash</a></div>}
    </div>
  );
};
