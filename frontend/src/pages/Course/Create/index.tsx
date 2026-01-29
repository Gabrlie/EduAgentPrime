/**
 * 课程创建/编辑页面 - StepsForm 分步表单
 */
import { PageContainer, StepsForm, ProFormText, ProFormDigit, ProFormSelect, ProFormTextArea, ProFormGroup } from '@ant-design/pro-components';
import { message, Button } from 'antd';
import { useNavigate, useParams, useIntl } from '@umijs/max';
import { useEffect, useState } from 'react';
import { createCourse, updateCourse, getCourseDetail, type CourseCreateParams } from '@/services/course';

const CourseCreate: React.FC = () => {
    const navigate = useNavigate();
    const params = useParams<{ id: string }>();
    const intl = useIntl();
    const [initialValues, setInitialValues] = useState<CourseCreateParams | undefined>();
    const [loading, setLoading] = useState(false);

    const isEdit = !!params.id;

    // 编辑模式：加载现有课程数据
    useEffect(() => {
        if (isEdit) {
            loadCourseData();
        } else {
            // 创建模式：计算默认学期
            setInitialValues({
                semester: calculateDefaultSemester(),
            } as CourseCreateParams);
        }
    }, [params.id]);

    const loadCourseData = async () => {
        setLoading(true);
        try {
            const data = await getCourseDetail(Number(params.id));
            const course = data.course;
            setInitialValues({
                name: course.name,
                semester: course.semester,
                class_name: course.class_name,
                total_hours: course.total_hours,
                practice_hours: course.practice_hours,
                course_type: course.course_type,
                textbook_isbn: course.textbook_isbn,
                textbook_name: course.textbook_name,
                textbook_image: course.textbook_image,
                textbook_publisher: course.textbook_publisher || undefined,
                textbook_link: course.textbook_link || undefined,
                course_catalog: course.course_catalog || undefined,
            });
        } catch (error) {
            message.error('加载课程数据失败');
        } finally {
            setLoading(false);
        }
    };

    // 计算默认学期
    const calculateDefaultSemester = (): string => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        if (month >= 1 && month <= 8) {
            return `${year - 1}—${year}学年度第 2 学期`;
        } else {
            return `${year}—${year + 1}学年度第 1 学期`;
        }
    };

    // 提交表单
    const handleFinish = async (values: CourseCreateParams) => {
        try {
            if (isEdit) {
                await updateCourse(Number(params.id), values);
                message.success(intl.formatMessage({ id: 'pages.courses.create.updateSuccess' }));
            } else {
                await createCourse(values);
                message.success(intl.formatMessage({ id: 'pages.courses.create.success' }));
            }
            navigate('/courses');
            return true;
        } catch (error) {
            message.error(intl.formatMessage({ id: 'pages.courses.create.failed' }));
            return false;
        }
    };

    return (
        <PageContainer
            header={{
                title: isEdit
                    ? intl.formatMessage({ id: 'pages.courses.create.edit' })
                    : intl.formatMessage({ id: 'pages.courses.create.title' }),
                onBack: () => navigate(-1),
            }}
            loading={loading}
        >
            <StepsForm
                onFinish={handleFinish}
                formProps={{
                    validateMessages: {
                        required: '此项为必填项',
                    },
                }}
            >
                {/* 步骤 1: 基本信息 */}
                <StepsForm.StepForm
                    name="basic"
                    title={intl.formatMessage({ id: 'pages.courses.create.step1.title' })}
                    initialValues={initialValues}
                >
                    <ProFormText
                        name="name"
                        label={intl.formatMessage({ id: 'pages.courses.create.name.label' })}
                        placeholder={intl.formatMessage({ id: 'pages.courses.create.name.placeholder' })}
                        rules={[{ required: true }]}
                        width="lg"
                    />
                    <ProFormText
                        name="semester"
                        label={intl.formatMessage({ id: 'pages.courses.create.semester.label' })}
                        placeholder={intl.formatMessage({ id: 'pages.courses.create.semester.placeholder' })}
                        rules={[{ required: true }]}
                        width="lg"
                        initialValue={calculateDefaultSemester()}
                    />
                    <ProFormText
                        name="class_name"
                        label={intl.formatMessage({ id: 'pages.courses.create.className.label' })}
                        placeholder="例如：计算机201班,计算机202班"
                        tooltip="支持多个班级，使用逗号分隔"
                        rules={[{ required: true }]}
                        width="lg"
                    />
                    <ProFormDigit
                        name="total_hours"
                        label={intl.formatMessage({ id: 'pages.courses.create.totalHours.label' })}
                        placeholder={intl.formatMessage({ id: 'pages.courses.create.totalHours.placeholder' })}
                        rules={[{ required: true }]}
                        min={1}
                        fieldProps={{ precision: 0 }}
                        width="lg"
                    />
                    <ProFormDigit
                        name="practice_hours"
                        label={intl.formatMessage({ id: 'pages.courses.create.practiceHours.label' })}
                        placeholder={intl.formatMessage({ id: 'pages.courses.create.practiceHours.placeholder' })}
                        rules={[
                            { required: true },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const totalHours = getFieldValue('total_hours');
                                    if (!value || !totalHours || value <= totalHours) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('实训学时不能超过课程学时'));
                                },
                            }),
                        ]}
                        min={0}
                        fieldProps={{ precision: 0 }}
                        width="lg"
                    />
                    <ProFormSelect
                        name="course_type"
                        label={intl.formatMessage({ id: 'pages.courses.create.courseType.label' })}
                        placeholder={intl.formatMessage({ id: 'pages.courses.create.courseType.placeholder' })}
                        rules={[{ required: true }]}
                        options={[
                            { label: intl.formatMessage({ id: 'pages.courses.create.courseType.A' }), value: 'A' },
                            { label: intl.formatMessage({ id: 'pages.courses.create.courseType.B' }), value: 'B' },
                            { label: intl.formatMessage({ id: 'pages.courses.create.courseType.C' }), value: 'C' },
                        ]}
                        width="lg"
                    />
                </StepsForm.StepForm>

                {/* 步骤 2: 教材信息 */}
                <StepsForm.StepForm
                    name="textbook"
                    title={intl.formatMessage({ id: 'pages.courses.create.step2.title' })}
                    initialValues={initialValues}
                >
                    <ProFormText
                        name="textbook_isbn"
                        label={intl.formatMessage({ id: 'pages.courses.create.textbookIsbn.label' })}
                        placeholder={intl.formatMessage({ id: 'pages.courses.create.textbookIsbn.placeholder' })}
                        rules={[{ required: true }]}
                        width="lg"
                    />
                    <ProFormText
                        name="textbook_name"
                        label={intl.formatMessage({ id: 'pages.courses.create.textbookName.label' })}
                        placeholder={intl.formatMessage({ id: 'pages.courses.create.textbookName.placeholder' })}
                        rules={[{ required: true }]}
                        width="lg"
                    />
                    <ProFormText
                        name="textbook_image"
                        label={intl.formatMessage({ id: 'pages.courses.create.textbookImage.label' })}
                        placeholder={intl.formatMessage({ id: 'pages.courses.create.textbookImage.placeholder' })}
                        rules={[{ required: true }]}
                        width="lg"
                    />
                    <ProFormText
                        name="textbook_publisher"
                        label={intl.formatMessage({ id: 'pages.courses.create.textbookPublisher.label' })}
                        placeholder={intl.formatMessage({ id: 'pages.courses.create.textbookPublisher.placeholder' })}
                        width="lg"
                    />
                    <ProFormText
                        name="textbook_link"
                        label={intl.formatMessage({ id: 'pages.courses.create.textbookLink.label' })}
                        placeholder={intl.formatMessage({ id: 'pages.courses.create.textbookLink.placeholder' })}
                        width="lg"
                    />
                </StepsForm.StepForm>

                {/* 步骤 3: 课程目录（可选） */}
                <StepsForm.StepForm
                    name="catalog"
                    title={intl.formatMessage({ id: 'pages.courses.create.step3.title' })}
                    initialValues={initialValues}
                >
                    <ProFormTextArea
                        name="course_catalog"
                        label={intl.formatMessage({ id: 'pages.courses.create.courseCatalog.label' })}
                        placeholder={intl.formatMessage({ id: 'pages.courses.create.courseCatalog.placeholder' })}
                        fieldProps={{
                            rows: 10,
                        }}
                        width="lg"
                    />
                </StepsForm.StepForm>
            </StepsForm>
        </PageContainer>
    );
};

export default CourseCreate;
