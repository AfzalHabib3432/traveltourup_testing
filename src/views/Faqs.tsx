import React from "react";
import FaqS from "@/components/FaqS";

const Faqs = (): React.ReactElement => {
  return (
    <div>
      <main className="bg-muted">
        <FaqS  secHead={false} />
      </main>
    </div>
  );
};

export default Faqs;
