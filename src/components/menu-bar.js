import { Button } from "./ui/button";

function MenuBar() {
  return (
    <div
      className={`flex flex-wrap gap-4 mx-auto mt-10 items-center justify-center`}
    >
      {/* <Button
        onClick={() => {
          location.href = "/account";
        }}
        variant={"outline"}
        className="min-w-[150px] hover:text-white hover:bg-orange-700 bg-orange-700/20 text-orange-700 "
      >
        Create account
      </Button> */}
      <Button
        onClick={() => {
          location.href = "/studio";
        }}
        variant={"outline"}
        className="min-w-[150px] hover:text-white hover:bg-blue-700 bg-blue-700/20 text-blue-700 "
      >
        Access studio
      </Button>
      {/* <Button
        onClick={() => {
          location.href = "/advisors";
        }}
        variant={"outline"}
        className="min-w-[150px]  hover:text-white hover:bg-green-700 bg-green-700/20 text-green-700 "
      >
        AI Career Advisors
      </Button> */}
      <Button
        onClick={() => {
          location.href = "/freelancers";
        }}
        variant={"outline"}
        className="min-w-[150px] hover:text-white hover:bg-purple-700 bg-purple-700/20 text-purple-700 "
      >
        Freelancers
      </Button>
      <Button
        onClick={() => {
          location.href = "/courses";
        }}
        variant={"outline"}
        className="min-w-[150px] hover:text-white hover:bg-slate-700 bg-slate-700/20 text-slate-700 "
      >
        Courses
      </Button>
    </div>
  );
}

export default MenuBar;
