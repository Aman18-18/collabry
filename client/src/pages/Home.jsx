import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import useProjects from "../hooks/useProjects";
import { newestFirst } from "../lib/projectOptions";

function Home() {
  const { projects, loading } = useProjects();

  // newest open notices first
  const latest = newestFirst(
    projects.filter((project) => project.status === "open")
  ).slice(0, 3);

  return (
    <>
      <main className="hero">
        <div className="hero-art" aria-hidden="true">
          <span className="sheet sheet-1" />
          <span className="sheet sheet-2" />
          <span className="sheet sheet-3" />
        </div>
        <div className="eyebrow">Find your team on campus</div>
        <h1>Somebody here needs exactly what you can build.</h1>
        <p>
          Pin your project, say who you're missing, and let people who want to
          build with you come to you.
        </p>
        <div className="hero-actions">
          <Link to="/browse" className="btn btn-primary">Browse the board</Link>
          <Link to="/postproject" className="btn">Pin a project</Link>
        </div>
      </main>

      {!loading && latest.length > 0 && (
        <section className="page home-board" aria-labelledby="latest-heading">
          <div className="page-head">
            <div>
              <div className="eyebrow">Fresh on the board</div>
              <h2 id="latest-heading" style={{ fontSize: 30 }}>Looking for teammates now</h2>
            </div>
            <Link to="/browse" className="btn">See all</Link>
          </div>

          <div className="board">
            {latest.map((project) => (
              <ProjectCard
                key={project._id}
                id={project._id}
                title={project.title}
                description={project.description}
                techStack={project.techStack}
                currentTeamSize={project.currentSize}
                teamSize={project.teamSize}
                status={project.status}
                projectType={project.projectType}
                ownerId={project.owner?._id}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default Home;
