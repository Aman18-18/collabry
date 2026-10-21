import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import useToast from "../hooks/useToast";
import ProjectForm from "../components/ProjectForm";

const EMPTY = {
    title: "",
    description: "",
    techStack: "",
    skillsNeeded: "",
    teamSize: "",
    roles: [],
    projectType: "hackathon",
    status: "open"
};

function PostProject() {
    const navigate = useNavigate();
    const toast = useToast();

    async function handleCreate(payload) {
        const response = await api.post("/projects", payload);

        toast.show("Your project is pinned to the board");
        navigate("/browse", {
            state: { highlightId: response.data.project._id }
        });
    }

    return (
        <main className="page page-narrow">
            <div className="page-head">
                <div>
                    <div className="eyebrow">New notice</div>
                    <h1>Pin a project</h1>
                </div>
            </div>

            <ProjectForm
                initial={EMPTY}
                submitLabel="Create project"
                onSubmit={handleCreate}
            />
        </main>
    );
}

export default PostProject;
