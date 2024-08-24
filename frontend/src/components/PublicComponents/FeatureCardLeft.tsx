import "../../styles/PublicStyles/FeatureCardLeft.css";

function FeatureCardLeft(props: { imagePath: string; description: string }) {
  return (
    <div className="feature-left">
      <div
        className="feature-image-left"
        style={{ backgroundImage: `url(${props.imagePath})` }}
      ></div>

      <div className="feature-content-left">
        <div className="feature-text-left">{props.description}</div>
      </div>
    </div>
  );
}

export default FeatureCardLeft;
