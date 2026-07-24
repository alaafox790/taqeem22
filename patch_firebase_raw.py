import re

with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

new_func = """
export async function fetchRawFirebaseRecords(teacherId: string): Promise<AssessmentRecord[]> {
  try {
    const q = query(collection(db, 'assessments'), where('teacher_id', '==', teacherId));
    const querySnapshot = await getDocs(q);
    const fetched: AssessmentRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      fetched.push(docSnap.data() as AssessmentRecord);
    });
    return fetched;
  } catch (err) {
    console.error("Error fetching raw records:", err);
    return [];
  }
}
"""

content = content.replace("export async function fetchFirebaseRecords", new_func + "\nexport async function fetchFirebaseRecords")

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)

