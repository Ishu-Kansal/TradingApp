import { Link } from "react-router-dom";
import "../../styles/UserStyles/components/HomePageCard.css";

interface HomePageCardProps {
  description: string;
  img_url: string;
  path_url: string;
}

function HomePageCard(props: HomePageCardProps) {
  return (
    <div className="HomePageCard">
      <div>
        {" "}
        <Link to={props.path_url} id="hcard-top-text">
          {props.description}
        </Link>
      </div>
      <div
        id="hcard-bottom-img"
        style={{ backgroundImage: `url(${props.img_url})` }}
      />
    </div>
  );
}

export default HomePageCard;
