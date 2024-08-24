import "../../styles/PublicStyles/FeatureCardRight.css";

function FeatureCardRight(props: { imagePath: string; description: string }) {
  return (
    <div className="feature-right">
      <div
        className="feature-image-right"
        style={{ backgroundImage: `url(${props.imagePath})` }}
      ></div>

      <div className="feature-content-right">
        <div className="feature-text-right">{props.description}</div>
      </div>
    </div>
  );
}

export default FeatureCardRight;
