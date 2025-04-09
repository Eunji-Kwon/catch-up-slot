import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "@/../lib/firebase";
import { doc, getDoc, collection, addDoc, getDocs } from "firebase/firestore";

export default function CalendarPage() {
  const router = useRouter();
  const { username } = router.query;

  const [userData, setUserData] = useState<any>(null);
  const [daysArray, setDaysArray] = useState<Date[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [reserverName, setReserverName] = useState("");
  const [meetingType, setMeetingType] = useState("");
    const [comment, setComment] = useState("");
    const [reservations, setReservations] = useState<any[]>([]);

    useEffect(() => {
        if (!username) return;
      
        const fetchReservations = async () => {
          const resSnapshot = await getDocs(collection(db, "users", username as string, "reservations"));
          const resData = resSnapshot.docs.map((doc) => doc.data());
          setReservations(resData);
        };
      
        fetchReservations();
      }, [username]);

  useEffect(() => {
    if (!username) return;

    

    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, "users", username as string));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        

        // 날짜 리스트 만들기
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        const tempDays: Date[] = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          tempDays.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
        setDaysArray(tempDays);
      } else {
        console.log("No such user!");
      }
    };

    fetchUserData();
  }, [username]);

  function handleSlotClick(date: Date, slotIndex: number) {
    setSelectedDate(date);
    setSelectedSlot(slotIndex);
    setShowModal(true);
  }

  async function handleReservation() {
    if (!reserverName || !selectedDate || selectedSlot === null) return;

    await addDoc(collection(db, "users", username as string, "reservations"), {
        reserverName,
        reservedDate: selectedDate.toISOString().split("T")[0],
        reservedSlot: selectedSlot,
        meetingType,
        comment,
        status: "pending",
        createdAt: new Date(),
      });

    setShowModal(false);
    setReserverName("");
    alert("예약이 완료되었습니다!");
  }

  if (!username) {
    return <div className="text-center mt-10 text-xl">Username is missing!</div>;
  }

  if (!userData) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <>
      {/* 예약 모달 */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">예약하기</h2>
            <input
              type="text"
              placeholder="당신의 이름(혹은 별명은?)"
              className="w-full border p-2 rounded mb-4"
              value={reserverName}
              onChange={(e) => setReserverName(e.target.value)}
            />
            <input
                type="text"
                placeholder="어떤 모임인가요? (예: 점심 / 저녁 / 술 / 번개)"
                className="w-full border p-2 rounded mb-4"
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                />

                <textarea
                placeholder="주인장에게 남기고 싶은 말 :)"
                className="w-full border p-2 rounded mb-4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                />
            <button
              onClick={handleReservation}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
              예약 확정
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 text-sm mt-2 w-full"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 메인 캘린더 페이지 */}
      <div className="min-h-screen p-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {username}'s Schedule
        </h1>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
            <div
              key={day}
              className={`text-center font-bold ${
                idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : ""
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-2">
          {daysArray.map((date, index) => (
            <div
              key={index}
              className="bg-white p-3 rounded shadow min-h-36 flex flex-col justify-between"
            >
              <div className="text-sm text-center font-semibold mb-1">
                {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>

              {/* 4칸 슬롯 */}
              <div className="flex flex-col gap-1">
              {[0, 1, 2, 3].map((slotIndex) => {
                const reserved = reservations.find(
                    (res) =>
                    res.reservedDate === date.toISOString().split("T")[0] &&
                    res.reservedSlot === slotIndex
                );

                return (
                    <div
                    key={slotIndex}
                    className={`h-6 rounded flex items-center justify-center text-xs ${
                        reserved
                        ? "bg-green-300 cursor-not-allowed"
                        : slotIndex === 3
                        ? "bg-yellow-200 cursor-pointer"
                        : "bg-gray-200 cursor-pointer"
                    }`}
                    onClick={() => {
                        if (!reserved) {
                        handleSlotClick(date, slotIndex);
                        }
                    }}
                    >
                    {reserved ? reserved.reserverName : ""}
                    </div>
                );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
