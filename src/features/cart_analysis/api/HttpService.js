import axios from "axios";

// 5. 장바구니 분석 (findAll)
export async function fetchAllAssociationRules(period) {
  console.log("period", period);
  const url =
    period === "all"
      ? "http://localhost:8090/app/association"
      : `http://localhost:8090/app/association?period=${period}`;

  const response = await axios.get(url);

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchAllAssociationRules 예외발생");
  }

  console.log(response.data);
  return response.data;
}

// 6. 장바구니 분석 (시간대별)
export async function fetchAllAssociationTimeRules() {
  const response = await axios.get(
    "http://localhost:8090/app/association/time"
  );

  if (response.status !== 200) {
    console.log("예외발생");
    throw new Error("fetchAllAssociationTimeRules 예외발생");
  }

  console.log(response.data);
  return response.data;
}
