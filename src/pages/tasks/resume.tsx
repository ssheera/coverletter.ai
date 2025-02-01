import {
    Container, createListCollection,
    Flex,
    Grid,
    GridItem,
    Group,
    Heading,
    HStack,
    IconButton,
    Input, Spinner,
    Text,
    Textarea
} from '@chakra-ui/react'
import React, {useEffect, useMemo, useState} from 'react'
import {Field} from '@/components/ui/field'
import {LuMinus, LuPlus} from 'react-icons/lu'
import {Checkbox} from '@/components/ui/checkbox'
import {createAxios} from '@/lib/axios'
import {Toaster, toaster} from '@/components/ui/toaster'
import {
    AlignmentType,
    Document,
    ExternalHyperlink,
    LevelFormat,
    Packer,
    Paragraph,
    PositionalTab,
    PositionalTabAlignment,
    PositionalTabLeader,
    PositionalTabRelativeTo,
    TextRun
} from 'docx'
import {SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText} from '@/components/ui/select'
import {FaSave} from 'react-icons/fa'
import {TbDownload, TbSparkles} from 'react-icons/tb'
import {Button} from '@/components/ui/button'
import RewriteTextArea from '@/components/RewriteTextArea'
import {ProfileLink, ResumeData, Section, Skill} from '@/interfaces/ResumeData'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ProtectedResumePage() {
    return <ProtectedRoute>
        <ResumePage/>
    </ProtectedRoute>
}

function ResumePage() {
    
    const axios = createAxios()

    const [forename, setForename] = React.useState('')
    const [surname, setSurname] = React.useState('')
    const [profileLinks, setProfileLinks] = React.useState<ProfileLink[]>([{profile: '', descriptor: '', hyperlink: ''}])
    const [sections, setSections] = React.useState<Section[]>([{name: '', items: [{title: '', from: '', to: '', list: false, description: ''}] }])
    const [skills, setSkills] = React.useState<Skill[]>([{type: '', items: ''}])

    const [llm, setLLM] = useState('Gemini')

    const apis = createListCollection({
        items: ['Gemini'],
    })

    const [jobDescription, setJobDescription] = React.useState('')

    const [saving, setSaving] = React.useState(false)
    const [processing, setProcessing] = React.useState(false)
    const [attemptLoad, setAttemptLoad] = React.useState(false)

    const fetchData = useMemo(() => {
        return async () => {
            try {
                const res = await axios.post('/api/user/profile', {request: 'load'}, {withCredentials: true})
                if (res.status == 200) {
                    const data = res.data.data
                    setForename(data.forename)
                    setSurname(data.surname)
                    setProfileLinks(data.profileLinks)
                    setSections(data.sections)
                    setSkills(data.skills)
                    toaster.create({
                        title: 'Success',
                        description: 'Resume fetched successfully',
                        type: 'success',
                        duration: 3000,
                    })
                } else {
                    toaster.error({
                        title: 'Error fetching user',
                        description: res.data.message,
                        type: 'error',
                        duration: 3000,
                    })
                }
            } catch (error) {
                toaster.error({
                    title: 'An error occurred',
                    type: 'error',
                    duration: 3000,
                })
                console.error('An error occurred:', error)
            }
        }
    }, [axios])

    useEffect(() => {
        if (!attemptLoad) {
            fetchData()
                .catch((error) => {
                    console.error('An error occurred:', error)
                })
            setAttemptLoad(true)
        }
    }, [attemptLoad, fetchData])

    async function generateResume() {

        function name(name: string) {
            return new Paragraph({
                children: [new TextRun({
                    text: name, bold: true, size: 15 * 2, font: 'Calibri'
                }),], spacing: {
                    after: 5 / 0.05
                }, alignment: 'center',
            })
        }

        function profileLink(name: string, cover: string, link?: string, end?: boolean) {
            if (link === '') link = undefined
            return [new TextRun({
                        text: name, underline: {
                            type: 'single'
                        }, size: 10.5 * 2, font: 'Calibri'
                    }), new TextRun({
                        text: ': ', size: 10.5 * 2, font: 'Calibri'
                    }), new ExternalHyperlink({
                        link: link ?? cover, children: [new TextRun({
                            text: cover, size: 10.5 * 2, font: 'Calibri', color: '0000FF', underline: {
                                type: 'single'
                            }
                        })]
                    }), !end ? new TextRun({
                        text: ' | ', size: 10.5 * 2, font: 'Calibri'
                    }) : new TextRun({
                        text: '', size: 10.5 * 2, font: 'Calibri'
                    })]
        }

        function sectionHeader(name: string) {
            return new Paragraph({
                children: [new TextRun({
                    text: name, bold: true, size: 11 * 2, allCaps: true, font: 'Calibri'
                })], spacing: {
                    before: 9 / 0.05, after: 6 / 0.05
                }, border: {
                    bottom: {
                        style: 'single',
                    }
                }, alignment: 'both'
            })
        }

        function experience(name: string, date: string, description: string, bullets?: boolean) {
            return [new Paragraph({
                children: [new TextRun({
                    text: name,
                    bold: true,
                    size: 11 * 2,
                    font: 'Calibri'
                }), new TextRun({
                    children: [
                        new PositionalTab({
                            alignment: PositionalTabAlignment.RIGHT,
                            relativeTo: PositionalTabRelativeTo.MARGIN,
                            leader: PositionalTabLeader.NONE,
                        }),
                        new TextRun({
                            text: date,
                            size: 11 * 2,
                            bold: true,
                            font: 'Calibri'
                        })
                    ]
                })], spacing: {
                    line: 1.15 * 240,
                }, keepNext: true,
            }),  ...description.split('\n').map((line) => {
                return bullets
                    ? new Paragraph({
                        numbering: {
                            reference: 'experience',
                            level: 0,
                        },
                        alignment: 'both',
                        indent: {
                            left: '0.6cm',
                            hanging: '0.5cm',
                        },
                        children: [
                            new TextRun({
                                text: line,
                                size: 11 * 2,
                                font: 'Calibri',
                            }),
                        ],
                    })
                    : new Paragraph({
                        children: [
                            new TextRun({
                                text: line,
                                size: 11 * 2,
                                font: 'Calibri',
                            }),
                        ],
                        spacing: {
                            line: 1.15 * 240,
                        },
                        alignment: 'both',
                    })
            })]
        }

        function __skills(type: string, names: string) {
            return new Paragraph({
                children: [
                    new TextRun({
                        text: type + ': ',
                        bold: true,
                        size: 10 * 2,
                        font: 'Calibri',
                    }),
                    new TextRun({
                        text: names,
                        size: 10 * 2,
                        font: 'Calibri',
                    }),
                ],
                spacing: {
                    after: 10 / 0.05
                }, alignment: 'left',
            })
        }

        const children = []
        children.push(name(forename + ' ' + surname))
        const plParagraph = new Paragraph({
            children: profileLinks.map((pl, index) => {
                return profileLink(pl.profile, pl.descriptor, pl.hyperlink, index === profileLinks.length - 1)
            }).flat(),
            alignment: 'center',
        })
        children.push(plParagraph)
        sections.forEach((section) => {
            children.push(sectionHeader(section.name))
            section.items.forEach((item) => {
                const exp = experience(item.title, item.from && item.to ? `${item.from} - ${item.to}` : item.from || item.to,
                    item.description.trimEnd(), item.list)
                exp.flat().forEach((e) => {
                    children.push(e)
                })
            })
        })
        if (skills[0].type !== '') {
            children.push(sectionHeader('Skills'))
            skills.forEach((skill) => {
                children.push(__skills(skill.type, skill.items))
            })
        }

        return new Document({
            numbering: {
                config: [{
                    reference: 'experience',
                    levels: [{
                        level: 0,
                        format: LevelFormat.BULLET,
                        alignment: AlignmentType.LEFT,
                        text: '\u00B7',
                        style: {
                            run: {
                                font: 'Symbol',
                                size: 11 * 2,
                            }
                        }
                    }]
                }]
            },
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: '0.7cm',
                            left: '1.27cm',
                            bottom: '0.7cm',
                            right: '1.27cm',
                            gutter: 0,
                            header: '1.25cm',
                            footer: '1.25cm',
                        }
                    }, type: 'continuous'
                },
                children: children
            }],
        })

    }

    const addProfileLink = () => {
        setProfileLinks([...profileLinks, {profile: '', descriptor: '', hyperlink: ''}])
    }

    const removeProfileLink = () => {
        if (profileLinks.length === 1) return
        const newProfileLinks = [...profileLinks]
        newProfileLinks.pop()
        setProfileLinks(newProfileLinks)
    }

    const addSection = () => {
        setSections([...sections, {name: '', items: [{title: '', from: '', to: '', list: false, description: ''}] }])
    }

    const removeSection = () => {
        if (sections.length === 1) return
        const newSections = [...sections]
        newSections.pop()
        setSections(newSections)
    }

    const addExperience = (section: number) => {
        const newSections = [...sections]
        newSections[section].items.push({title: '', from: '', to: '', list: false, description: ''})
        setSections(newSections)
    }

    const removeExperience = (section: number) => {
        if (sections[section].items.length === 1) return
        const newSections = [...sections]
        newSections[section].items.pop()
        setSections(newSections)
    }

    const addSkill = () => {
        setSkills([...skills, {type: '', items: ''}])
    }

    const removeSkill = () => {
        if (skills.length === 1) return
        const newSkills = [...skills]
        newSkills.pop()
        setSkills(newSkills)
    }
    
    const handleSave = async () => {

        setSaving(true)

        const data: ResumeData = {
            forename: forename,
            surname: surname,
            profileLinks: profileLinks,
            sections: sections,
            skills: skills
        }

        const res = await axios.post('/api/user/profile', { data, request: 'save'}, { withCredentials: true })

        try {
            if (res.status == 200) {
                toaster.create({
                    title: 'Success',
                    description: 'Your resume has been saved',
                    type: 'success',
                    duration: 3000,
                })
            } else {
                toaster.error({
                    title: 'Failed',
                    description: res.data.message,
                    duration: 3000,
                })
            }
        } catch (error) {
            toaster.error({
                title: 'Failed',
                description: 'Please try again later',
                duration: 3000,
            })
            console.log('An error occurred:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleDownload = async () => {
        const buffer = await Packer.toBuffer(await generateResume())
        const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Resume.docx`
        a.click()
    }

    const handleProcess = async () => {
        setProcessing(true)

        const data: ResumeData = {
            forename: forename,
            surname: surname,
            profileLinks: profileLinks,
            sections: sections,
            skills: skills
        }

        const res = await axios.post('/api/tasks/resume', { data, llm }, { withCredentials: true })

        try {
            console.log(res)
            if (res.status == 201) {
                const data = res.data.response
                setForename(data.forename)
                setSurname(data.surname)
                setProfileLinks(data.profileLinks)
                setSections(data.sections)
                setSkills(data.skills)
                toaster.create({
                    title: 'Success',
                    description: 'Resume processed successfully',
                    type: 'success',
                    duration: 3000,
                })
            } else {
                toaster.error({
                    title: 'Failed',
                    description: res.data.message,
                    duration: 3000,
                })
            }
        } catch (error) {
            toaster.error({
                title: 'Failed',
                description: 'Please try again later',
                duration: 3000,
            })
            console.log('An error occurred:', error)
        } finally {
            setProcessing(false)
        }
    }

    return (
        <Container maxW='8xl' py={20}>

            <Toaster/>

            <Grid templateColumns='repeat(5, 1fr)' gap={20}>
                <GridItem colSpan={[5, 3]}>
                    <Heading size='xl' my={4}>Resume Builder</Heading>

                    <Text fontSize='sm' color='gray' mb={4}>
                        Enter your forename and surname
                    </Text>

                    <Flex justify='center'>
                        <HStack gap='10' width='full'>
                            <Field required label='Forename'>
                                <Input
                                    id='forename'
                                    type='text'
                                    placeholder='John'
                                    variant='subtle'
                                    value={forename}
                                    onChange={(e) => setForename(e.target.value)}
                                />
                            </Field>
                            <Field required label='Surname'>
                                <Input
                                    id='surname'
                                    type='text'
                                    placeholder='Doe'
                                    variant='subtle'
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                />
                            </Field>
                        </HStack>
                    </Flex>

                    <Text fontSize='sm' color='gray' mt={8} mb={4}>
                        Enter profile links
                    </Text>

                    <Flex justify='center' direction='column' gap='2'>
                        {profileLinks.map((profile, index) => (
                            <Group attached key={'pl-' + index}>
                                <Input
                                    placeholder='LinkedIn'
                                    width='40'
                                    variant='subtle'
                                    value={profile.profile}
                                    onChange={(e) => {
                                        const newProfileLinks = [...profileLinks]
                                        newProfileLinks[index].profile = e.target.value
                                        setProfileLinks(newProfileLinks)
                                    }}
                                />
                                <Input
                                    placeholder='Describe your profile'
                                    value={profile.descriptor}
                                    onChange={(e) => {
                                        const newProfileLinks = [...profileLinks]
                                        newProfileLinks[index].descriptor = e.target.value
                                        setProfileLinks(newProfileLinks)
                                    }}
                                />
                                <Input
                                    placeholder='Hyperlink'
                                    value={profile.hyperlink}
                                    onChange={(e) => {
                                        const newProfileLinks = [...profileLinks]
                                        newProfileLinks[index].hyperlink = e.target.value
                                        setProfileLinks(newProfileLinks)
                                    }}
                                />
                            </Group>
                        ))}
                    </Flex>

                    <HStack gap='4'>
                        <IconButton variant='subtle' size='sm' mt={2} onClick={addProfileLink}>
                            <LuPlus/>
                        </IconButton>
                        <IconButton variant='subtle' size='sm' mt={2} onClick={removeProfileLink}>
                            <LuMinus/>
                        </IconButton>
                    </HStack>

                    <Text fontSize='sm' color='gray' mt={8} mb={4}>
                        Add your skills
                    </Text>

                    <Flex justify='center' direction='column' gap='2'>
                        {skills.map((skill, index) => (
                            <Group attached key={'skill-' + index}>
                                <Input
                                    placeholder='Programming Languages'
                                    width='60'
                                    variant='subtle'
                                    value={skill.type}
                                    onChange={(e) => {
                                        const newSkills = [...skills]
                                        newSkills[index].type = e.target.value
                                        setSkills(newSkills)
                                    }}
                                />
                                <Input
                                    placeholder='JavaScript, Python, Java'
                                    value={skill.items}
                                    onChange={(e) => {
                                        const newSkills = [...skills]
                                        newSkills[index].items = e.target.value
                                        setSkills(newSkills)
                                    }}
                                />
                            </Group>
                        ))}
                    </Flex>

                    <HStack gap='4'>
                        <IconButton variant='subtle' size='sm' mt={2} onClick={addSkill}>
                            <LuPlus/>
                        </IconButton>
                        <IconButton variant='subtle' size='sm' mt={2} onClick={removeSkill}>
                            <LuMinus/>
                        </IconButton>
                    </HStack>

                    <Text fontSize='sm' color='gray' mt={8} mb={4}>
                        Add your experience and education
                    </Text>

                    <Flex justify='center' direction='column' gap='2'>
                        {sections.map((section, index) => (
                            <Container key={'section-' + index} shadow='lg' p={4} borderRadius='md'>
                                <Field required label='Section Name' mb={10}>
                                    <Input
                                        placeholder='Experience'
                                        variant='subtle'
                                        value={section.name}
                                        onChange={(e) => {
                                            const newSections = [...sections]
                                            newSections[index].name = e.target.value
                                            setSections(newSections)
                                        }}
                                    />
                                </Field>
                                <Flex direction='column' gap='10'>
                                    {section.items.map((item, i) => (
                                        <Flex direction='column' key={'item-' + i} gap='2'>
                                            <Field required label='Title'>
                                                <Input
                                                    placeholder='Software Engineer'
                                                    variant='subtle'
                                                    value={item.title}
                                                    onChange={(e) => {
                                                        const newSections = [...sections]
                                                        newSections[index].items[i].title = e.target.value
                                                        setSections(newSections)
                                                    }}
                                                />
                                            </Field>
                                            <Group>
                                                <Input
                                                    placeholder='From'
                                                    variant='subtle'
                                                    value={item.from}
                                                    onChange={(e) => {
                                                        const newSections = [...sections]
                                                        newSections[index].items[i].from = e.target.value
                                                        setSections(newSections)
                                                    }}
                                                />
                                                <Input
                                                    placeholder='To'
                                                    variant='subtle'
                                                    value={item.to}
                                                    onChange={(e) => {
                                                        const newSections = [...sections]
                                                        newSections[index].items[i].to = e.target.value
                                                        setSections(newSections)
                                                    }}
                                                />
                                            </Group>
                                            <Field required label='Description'>
                                                <Text fontSize='sm' color='gray'>
                                                    Add a list of responsibilities, each separated by a new line
                                                </Text>
                                                <Checkbox
                                                    variant='subtle' size='sm'
                                                    checked={item.list}
                                                    onCheckedChange={(checked ) => {
                                                        const newSections = [...sections]
                                                        newSections[index].items[i].list = checked.checked as boolean
                                                        setSections(newSections)
                                                    }}
                                                >
                                                    List
                                                </Checkbox>
                                                <RewriteTextArea
                                                    placeholder=''
                                                    minHeight='200px'
                                                    resize='none'
                                                    variant='subtle'
                                                    value={item.description}
                                                    llm={llm}
                                                    jobDescription={jobDescription}
                                                    onGenerate={(response: string) => {
                                                        const newSections = [...sections]
                                                        newSections[index].items[i].description = response
                                                        setSections(newSections)
                                                    }}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                                        const newSections = [...sections]
                                                        newSections[index].items[i].description = e.target.value
                                                        setSections(newSections)
                                                    }}
                                                />
                                            </Field>
                                        </Flex>
                                    ))}
                                </Flex>
                                <HStack gap='4' mt={2}>
                                    <IconButton variant='subtle' size='sm' mt={2} onClick={() => addExperience(index)}>
                                        <LuPlus/>
                                    </IconButton>
                                    <IconButton variant='subtle' size='sm' mt={2} onClick={() => removeExperience(index)}>
                                        <LuMinus/>
                                    </IconButton>
                                </HStack>
                            </Container>
                        ))}
                        <HStack gap='4'>
                            <Button variant='subtle' size='sm' mt={2} onClick={addSection}>
                                Add Section
                            </Button>
                            <Button variant='subtle' size='sm' mt={2} onClick={removeSection}>
                                Remove Section
                            </Button>
                        </HStack>
                    </Flex>
                </GridItem>
                <GridItem colSpan={[5, 2]} position='sticky' top='0' alignSelf='flex-start'>
                    <Heading size='xl' my={4}>AI Settings</Heading>

                    <Flex justify='center' direction='column'>
                        <Text fontSize='sm' color='gray' mb={4}>
                            Select the language model to use
                        </Text>

                        <SelectRoot
                            value={[llm]}
                            onValueChange={({ value }) => setLLM(value[0])}
                            collection={apis}
                            mb={4}
                            width={60}
                            variant={'subtle'}
                        >
                            <SelectTrigger>
                                <SelectValueText />
                            </SelectTrigger>
                            <SelectContent>
                                {apis.items.map((api) => (
                                    <SelectItem item={api} key={api}>{api}</SelectItem>
                                ))}
                            </SelectContent>
                        </SelectRoot>

                        <Field label='Job Description'>
                            <Textarea
                                placeholder='Paste the job description here'
                                minHeight='500px'
                                resize='none'
                                variant='subtle'
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </Field>

                        <HStack mt={8}>
                            <IconButton disabled={saving} variant='subtle' onClick={handleSave}>
                                { saving ? <Spinner size='sm'/> : <FaSave/> }
                            </IconButton>

                            <IconButton variant='subtle' onClick={handleDownload}>
                                <TbDownload/>
                            </IconButton>

                            <IconButton disabled={processing} variant='subtle' onClick={handleProcess}>
                                { processing ? <Spinner size='sm'/> : <TbSparkles/> }
                            </IconButton>
                        </HStack>

                        <Text fontSize='sm' color='gray' mt={4}>
                            {`You can save your resume, download it or process it with ${llm}. You can also process each section individually with ${llm} by clicking the sparkles icon`}
                        </Text>

                    </Flex>

                </GridItem>
            </Grid>

        </Container>
    )

}
